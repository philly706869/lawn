<script lang="ts">
  import Input from "#lib/components/Input.svelte";
  import { parse_records, push_records } from "./bulk.ts";

  let api_key = $state("");
  let password = $state("");
  let json = $state("");
  let saving = $state(false);
  let status = $state("");
  const preview = $derived.by(() => {
    if (!json.trim()) return { entries: [], error: "" };
    try {
      return { entries: parse_records(json), error: "" };
    } catch (error) {
      return {
        entries: [],
        error: error instanceof Error ? error.message : "JSON 형식을 확인해 주세요.",
      };
    }
  });

  async function load_file(event: Event) {
    const file = (event.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      json = await file.text();
      status = "";
    } catch {
      status = "파일을 읽지 못했습니다.";
    }
  }

  async function save() {
    if (saving || preview.error || !preview.entries.length) return;
    saving = true;
    status = "";
    const token = api_key;
    api_key = "";
    try {
      const result = await push_records({ api_key: token, password, json });
      status = result.isOk()
        ? `저장했습니다. 배포가 완료되면 반영됩니다. 커밋: ${result.value.commit_sha}`
        : result.error;
    } catch {
      status = "처리 중 오류가 발생했습니다. 저장 상태를 확인한 뒤 다시 시도해 주세요.";
    } finally {
      saving = false;
    }
  }
</script>

<svelte:head><title>records.json 일괄 반영 · Lawn</title></svelte:head>

<main class="min-h-dvh bg-background p-6 font-sans text-sm text-text">
  <div class="mx-auto max-w-4xl space-y-6">
    <a href="/mod" class="text-blue-400 underline">← 개별 입력</a>
    <h1 class="text-2xl font-semibold">records.json 일괄 반영</h1>
    <p class="text-gray-400">
      원문의 공백을 제외한 글자 수를 계산해 data 브랜치의 data.json에 한 번에 저장합니다. 같은
      날짜는 덮어쓰고 다른 날짜는 유지합니다. 원문과 진행 상태 필드는 저장하지 않습니다.
    </p>
    <fieldset disabled={saving} class="space-y-4 disabled:opacity-60">
      <Input label="API Key (저장된 키가 있으면 생략)" bind:value={api_key} password />
      <Input label="Password (기존 /mod와 동일)" bind:value={password} password />
      <label class="block space-y-2">
        <span class="font-semibold">records.json 파일</span>
        <input
          type="file"
          accept=".json,application/json"
          onchange={(event) => void load_file(event)}
          class="block w-full rounded-md border border-border p-3"
        />
      </label>
      <Input label="또는 JSON 붙여넣기" bind:value={json} rows={10} />
    </fieldset>
    {#if preview.error}
      <p role="alert" class="whitespace-pre-wrap text-red-400">{preview.error}</p>
    {/if}
    {#if preview.entries.length}
      <section class="space-y-3">
        <h2 class="text-lg font-semibold">반영할 기록 {preview.entries.length}개</h2>
        <div class="max-h-80 overflow-auto rounded-md border border-border">
          <table class="w-full text-left">
            <thead class="sticky top-0 bg-background"
              ><tr
                ><th class="p-3">날짜</th><th class="p-3">글자 수</th><th class="p-3">링크</th></tr
              ></thead
            >
            <tbody>
              {#each preview.entries as entry (entry.date)}
                <tr class="border-t border-border"
                  ><td class="p-3 whitespace-nowrap">{entry.date}</td><td class="p-3"
                    >{entry.size}</td
                  ><td class="p-3"
                    ><a
                      href={entry.link}
                      target="_blank"
                      rel="noreferrer"
                      class="break-all text-blue-400 underline">{entry.link}</a
                    ></td
                  ></tr
                >
              {/each}
            </tbody>
          </table>
        </div>
      </section>
    {/if}
    <p role="status" class="break-all whitespace-pre-wrap">{status}</p>
    <button
      class="rounded-md border border-border bg-primary px-4 py-2 font-medium text-text-primary disabled:opacity-50"
      disabled={saving || !!preview.error || !preview.entries.length}
      onclick={() => void save()}
    >
      {saving ? "저장 중…" : `${preview.entries.length}개 기록 저장 및 배포`}
    </button>
  </div>
</main>
