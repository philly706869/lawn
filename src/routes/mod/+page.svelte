<script lang="ts">
  import Input from "#lib/components/Input.svelte";
  import Lawn from "#lib/components/Lawn.svelte";
  import { message } from "#lib/message.ts";
  import { push_grass } from "#lib/mod.ts";

  const default_date = () => {
    return new Date(Date.now() - 12 * 60 * 60 * 1000).toLocaleDateString("sv-SE", {
      timeZone: "Asia/Seoul",
    });
  };

  let api_key = $state("");
  let date = $state(default_date());
  let link = $state("");
  let content = $state("");
  let saving = $state(false);
  let status = $state("");

  const on_push_grass_click = async () => {
    if (saving) return;
    saving = true;
    status = "";
    const api_key_ = api_key;
    api_key = "";
    const result = await push_grass({ api_key: api_key_, date, link, content });
    if (result.isOk()) {
      date = "";
      link = "";
      content = "";
      status = message.mod.pushed(result.value.commit_sha);
    } else {
      status = result.error;
    }
    saving = false;
  };
</script>

<div class="min-h-dvh bg-background">
  <div class="mx-auto w-full max-w-4xl space-y-6 p-6">
    <Lawn />
    <div class="space-y-2">
      <Input label={message.mod.api_key} bind:value={api_key} password disabled={saving} />
      <Input label={message.mod.date} bind:value={date} disabled={saving} />
      <Input label={message.mod.link} bind:value={link} disabled={saving} />
      <Input label={message.mod.content} bind:value={content} rows={20} disabled={saving} />
    </div>
    <div class="font-sans text-sm text-text">
      {status}
    </div>
    <div class="flex justify-end">
      <button
        class="flex h-8 items-center rounded-md border border-white/15 bg-primary px-3"
        disabled={saving}
        onclick={() => void on_push_grass_click()}
      >
        <div class="font-sans text-sm font-medium text-text-primary">
          {saving ? message.mod.pushing : message.mod.push_grass}
        </div>
      </button>
    </div>
  </div>
</div>
