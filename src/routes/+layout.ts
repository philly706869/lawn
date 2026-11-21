import { dev } from "$app/env";

export const prerender = !dev;
export const ssr = true;
export const csr = true;
