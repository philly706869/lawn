import { message } from "#lib/message.ts";
import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";
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

const storage_key = "lawn.api_key.v1";
const iterations = 600_000;
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

interface Input {
  api_key: string;
  password: string;
  date: string;
  link: string;
  content: string;
}

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

type StoredKey = z.infer<typeof stored_key_schema>;
const stored_key_schema = z.object({
  version: z.literal(1),
  salt: z.string(),
  iv: z.string(),
  ciphertext: z.string(),
});

const to_base64 = (bytes: Uint8Array) =>
  btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""));
const from_base64 = (text: string) => Uint8Array.from(atob(text), (char) => char.charCodeAt(0));

const derive_key = async (password: string, salt: Uint8Array<ArrayBuffer>) => {
  const material = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveKey",
  ]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
};

const resolve_api_key = async (
  api_key: string,
  password: string,
): Promise<Result<string, string>> => {
  if (!password) return err(message.error.password_required);
  try {
    if (api_key.trim()) {
      const token = api_key.trim();
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const key = await derive_key(password, salt);
      const ciphertext = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encoder.encode(token),
      );
      localStorage.setItem(
        storage_key,
        JSON.stringify({
          version: 1,
          salt: to_base64(salt),
          iv: to_base64(iv),
          ciphertext: to_base64(new Uint8Array(ciphertext)),
        } satisfies StoredKey),
      );
      return ok(token);
    }

    const stored = localStorage.getItem(storage_key);
    if (!stored) return err(message.error.api_key_missing);
    try {
      const { salt, iv, ciphertext } = stored_key_schema.parse(JSON.parse(stored));
      const key = await derive_key(password, from_base64(salt));
      const plaintext = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: from_base64(iv) },
        key,
        from_base64(ciphertext),
      );
      return ok(decoder.decode(plaintext));
    } catch {
      return err(message.error.decryption_failed);
    }
  } catch {
    return err(message.error.key_storage_failed);
  }
};

async function load_data(
  headers: HeadersInit,
): Promise<Result<{ data: Data; file_sha: string }, string>> {
  try {
    const response = await fetch(DATA_GET_ENDPOINT, { headers, cache: "no-store" });
    if (!response.ok) return err(message.error.load.status(String(response.status)));
    try {
      const schema = z.object({
        sha: z.string(),
        content: z.string(),
        encoding: z.literal("base64"),
      });
      const json = await response.json();
      const file = schema.parse(json);
      const bytes = from_base64(file.content);
      const data_json = decoder.decode(bytes);
      const data_object = JSON.parse(data_json);
      const data = data_schema.parse(data_object);
      return ok({ data, file_sha: file.sha });
    } catch {
      return err(message.error.load.parse);
    }
  } catch {
    return err(message.error.load.fetch);
  }
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

  try {
    const response = await fetch(DATA_PUT_ENDPOINT, { method: "PUT", headers, body });
    if (response.status === 409) return err(message.error.save.conflict);
    if (!response.ok) return err(message.error.save.status(String(response.status)));
    try {
      const schema = z.object({
        commit: z.object({
          sha: z.string(),
        }),
      });
      const json = await response.json();
      const data = schema.parse(json);
      return ok({ commit_sha: data.commit.sha });
    } catch {
      return err(message.error.save.parse);
    }
  } catch {
    return err(message.error.save.fetch);
  }
}

export const push_grass = async (input: Input): Promise<Result<{ commit_sha: string }, string>> => {
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
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return err(message.error.invalid_link);
  }

  const size = Array.from(segmenter.segment(input.content.replace(/\s/gu, ""))).length;

  const token = await resolve_api_key(input.api_key, input.password);
  if (token.isErr()) return err(token.error);

  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token.value}`,
    "Content-Type": "application/json",
  };

  const load_data_res = await load_data(headers);
  if (load_data_res.isErr()) return err(load_data_res.error);
  const { data, file_sha } = load_data_res.value;

  const save_data_res = await save_data({ headers, data, file_sha, date, link: url.href, size });
  if (save_data_res.isErr()) return err(save_data_res.error);
  const { commit_sha } = save_data_res.value;

  try {
    const body = JSON.stringify({
      ref: MAIN_BRANCH,
      inputs: {
        data_ref: commit_sha,
      },
    });
    const response = await fetch(DISPATCH_ENDPOINT, { method: "POST", headers, body });
    if (!response.ok) return err(message.error.dispatch.status(String(response.status)));
    return ok({ commit_sha });
  } catch {
    return err(message.error.dispatch.fetch);
  }
};
