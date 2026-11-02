import { message } from "#lib/message.ts";
import { err, ok, Result, ResultAsync } from "neverthrow";
import { z } from "zod";

const API_OWNER = "philly706869";
const API_REPO = "lawn";
const MAIN_BRANCH = "main";
const DATA_BRANCH = "data";
const DATA_FILE = "data.json";
const API_BASE = `https://api.github.com/repos/${API_OWNER}/${API_REPO}`;
const DATA_GET_ENDPOINT = `${API_BASE}/contents/${DATA_FILE}?ref=${DATA_BRANCH}`;
const DATA_PUT_ENDPOINT = `${API_BASE}/contents/${DATA_FILE}`;
const DISPATCH_ENDPOINT = `${API_BASE}/actions/workflows/build.yml/dispatches`;

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

type Data = z.infer<typeof data_schema>;
const data_schema = z.object({
  last_modified: z.string(),
  grass: z.array(
    z.object({
      date: z.string(),
      link: z.string(),
      size: z.number(),
    }),
  ),
});

function to_base64(bytes: Uint8Array): string {
  return btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""));
}

function from_base64(text: string): Uint8Array {
  return Uint8Array.from(atob(text), (char) => char.charCodeAt(0));
}

async function load_data(
  headers: HeadersInit,
): Promise<Result<{ data: Data; file_sha: string }, string>> {
  const load = ResultAsync.fromThrowable(() => {
    return fetch(DATA_GET_ENDPOINT, { headers, cache: "no-store" });
  });
  const load_result = await load();
  if (load_result.isErr()) {
    return err(message.error.load.fetch);
  }
  const response = load_result.value;
  if (!response.ok) {
    return err(message.error.load.status(String(response.status)));
  }
  const schema = z.object({
    sha: z.string(),
    content: z.string(),
    encoding: z.literal("base64"),
  });
  const parse = ResultAsync.fromThrowable(async () => {
    const json = await response.json();
    const file = schema.parse(json);
    const bytes = from_base64(file.content);
    const data_json = decoder.decode(bytes);
    const data_object = JSON.parse(data_json);
    const data = data_schema.parse(data_object);
    return { data, file_sha: file.sha };
  });
  const parse_result = await parse();
  if (parse_result.isErr()) {
    return err(message.error.load.parse);
  }
  return ok(parse_result.value);
}

async function save_data({
  headers,
  data,
  file_sha,
  date,
  link,
  size,
}: {
  headers: HeadersInit;
  data: Data;
  file_sha: string;
  date: string;
  link: string;
  size: number;
}): Promise<Result<{ commit_sha: string }, string>> {
  const grass = data.grass.filter((item) => item.date !== date);
  grass.push({ date, link, size });
  grass.sort((a, b) => a.date.localeCompare(b.date));
  const payload: Data = {
    last_modified: new Date().toISOString(),
    grass: grass,
  };
  const json_payload = JSON.stringify(payload, null, 2) + "\n";
  const encoded_payload = encoder.encode(json_payload);
  const base64_payload = to_base64(encoded_payload);
  const body = JSON.stringify({
    branch: DATA_BRANCH,
    message: `Update grass for ${date}`,
    sha: file_sha,
    content: base64_payload,
  });

  const save = ResultAsync.fromThrowable(() => {
    return fetch(DATA_PUT_ENDPOINT, { method: "PUT", headers, body });
  });
  const save_result = await save();
  if (save_result.isErr()) {
    return err(message.error.save.fetch);
  }
  const response = save_result.value;
  if (response.status === 409) {
    return err(message.error.save.conflict);
  }
  if (!response.ok) {
    return err(message.error.save.status(String(response.status)));
  }
  const schema = z.object({
    commit: z.object({
      sha: z.string(),
    }),
  });
  const parse = ResultAsync.fromThrowable(async () => {
    const json = await response.json();
    const data = schema.parse(json);
    return { commit_sha: data.commit.sha };
  });
  const parse_result = await parse();
  if (parse_result.isErr()) {
    return err(message.error.save.parse);
  }
  return ok(parse_result.value);
}

export const push_grass = async (input: {
  api_key: string;
  date: string;
  link: string;
  content: string;
}): Promise<Result<{ commit_sha: string }, string>> => {
  const api_key = input.api_key.trim();
  if (api_key.length === 0) {
    return err(message.error.api_key_missing);
  }

  const date = input.date.trim();
  const parsed_date = new Date(`${date}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isFinite(parsed_date.getTime()) ||
    parsed_date.toISOString().slice(0, 10) !== date
  ) {
    return err(message.error.invalid_date);
  }

  const link = input.link.trim();
  const new_url = Result.fromThrowable(() => new URL(link));
  const url_result = new_url();
  if (url_result.isErr()) {
    return err(message.error.invalid_link);
  }
  const url = url_result.value;

  const content = input.content.replace(/\s/gu, "");
  const segments = segmenter.segment(content);
  const buffer = Array.from(segments);
  const size = buffer.length;

  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${api_key}`,
    "Content-Type": "application/json",
  };

  const load_data_res = await load_data(headers);
  if (load_data_res.isErr()) {
    return err(load_data_res.error);
  }
  const { data, file_sha } = load_data_res.value;

  const save_data_res = await save_data({ headers, data, file_sha, date, link: url.href, size });
  if (save_data_res.isErr()) {
    return err(save_data_res.error);
  }
  const { commit_sha } = save_data_res.value;

  const body = JSON.stringify({
    ref: MAIN_BRANCH,
    inputs: {
      data_ref: commit_sha,
    },
  });
  const dispatch = ResultAsync.fromThrowable(() => {
    return fetch(DISPATCH_ENDPOINT, {
      method: "POST",
      headers,
      body,
    });
  });
  const dispatch_result = await dispatch();
  if (dispatch_result.isErr()) {
    return err(message.error.dispatch.fetch);
  }
  const response = dispatch_result.value;
  if (!response.ok) {
    return err(message.error.dispatch.status(String(response.status)));
  }
  return ok({ commit_sha });
};
