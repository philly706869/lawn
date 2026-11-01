<script lang="ts">
  import { asset } from "$app/paths";
  import "../app.css";
  import type { LayoutProps } from "./$types";

  let { children }: LayoutProps = $props();

  const title = "이론학회 잔디밭";
  const description = "이론학회 일기 잔디밭";
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="color-scheme" content="dark" />
  <meta name="robots" content="noindex, nofollow" />
  <meta property="og:site_name" content={title} />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <link rel="icon" type="image/svg+xml" href={asset("lawn.svg")} />
</svelte:head>

{@render children()}
