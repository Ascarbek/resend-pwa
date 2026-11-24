import { accessToken } from '../stores/session.svelte.ts';

/** Non-2xx response from the Bun server. */
export class ApiError extends Error {
	constructor(
		readonly status: number,
		message: string
	) {
		super(message);
	}
}

/** Thin fetch wrapper for the Bun server's `/api/*` routes. */
export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
	const headers = new Headers(init.headers);
	if (accessToken.value) headers.set('authorization', `Bearer ${accessToken.value}`);
	if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json');

	const res = await fetch(`/api${path}`, { ...init, headers });
	if (!res.ok) throw new ApiError(res.status, `API ${res.status}: ${await res.text()}`);
	return (res.status === 204 ? undefined : await res.json()) as T;
}
