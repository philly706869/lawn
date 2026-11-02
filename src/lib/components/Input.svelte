<script lang="ts">
  interface Props {
    label: string;
    value: string;
    password?: boolean;
    rows?: number;
    disabled?: boolean;
  }

  let { label, value = $bindable(), password = false, rows, disabled = false }: Props = $props();

  const id = $props.id();
</script>

<div class="space-y-1 font-sans text-sm text-text">
  <label class="block leading-normal font-semibold" for={id}>
    {label}
  </label>
  {#if rows === undefined}
    <input
      class="w-full rounded-md border border-border px-3 py-1.25 inset-ring-outline outline-none
      focus-visible:border-outline focus-visible:inset-ring"
      {id}
      bind:value
      type={password ? "password" : undefined}
      {disabled}
    />
  {:else}
    <textarea
      class="w-full rounded-md border border-border px-3 py-2 leading-normal inset-ring-outline
      outline-none focus-visible:border-outline focus-visible:inset-ring"
      {id}
      bind:value
      {rows}></textarea>
  {/if}
</div>
