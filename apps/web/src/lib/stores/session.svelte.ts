import { persisted } from './persisted.svelte.ts';

/** Access token for the self-hosted server (matches ACCESS_TOKEN on the server). */
export const accessToken = persisted<string>('resend-pwa:access-token', '');
