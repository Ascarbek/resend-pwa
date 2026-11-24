import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { accessToken } from '#lib/stores/session.svelte.ts';
import type { LayoutLoad } from './$types';

// Pure client-side SPA: all data lives in Resend (via the Bun server) or localStorage.
export const ssr = false;
export const prerender = false;

// Auth guard: without a saved token everything goes to /login; with one, /login goes to the inbox.
// Reading url.pathname makes this rerun on every client-side navigation.
export const load: LayoutLoad = ({ url }) => {
	const onLogin = url.pathname === resolve('/login');
	if (!accessToken.value && !onLogin) redirect(307, resolve('/login'));
	if (accessToken.value && onLogin) redirect(307, resolve('/'));
};
