import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { ApiError } from '#lib/api/client.ts';
import { listEmails } from '#lib/api/emails.ts';
import { accessToken } from '#lib/stores/session.svelte.ts';
import type { InboxState } from '../state.svelte.ts';

/** Fetches the next page from the server (cursor = last loaded id) and appends it. */
export function createLoadMore(state: InboxState) {
	return async function loadMore(): Promise<void> {
		if (state.loading || !state.hasMore) return;
		state.loading = true;
		state.error = '';
		try {
			const page = await listEmails(state.emails.at(-1)?.id);
			const seen = new Set(state.emails.map((email) => email.id));
			state.emails.push(...page.emails.filter((email) => !seen.has(email.id)));
			state.hasMore = page.has_more;
		} catch (err) {
			if (err instanceof ApiError && err.status === 401) {
				// Token no longer accepted (rotated on the server): sign in again.
				accessToken.value = '';
				await goto(resolve('/login'));
				return;
			}
			state.error =
				err instanceof ApiError && err.status === 429
					? 'Resend is rate limiting us. Try again in a moment.'
					: 'Couldn’t load emails.';
		} finally {
			state.loading = false;
		}
	};
}
