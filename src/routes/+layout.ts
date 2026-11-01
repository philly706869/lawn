import { dev } from "$app/env";

export const prerender = !dev;
export const ssr = false;
export const csr = true;
