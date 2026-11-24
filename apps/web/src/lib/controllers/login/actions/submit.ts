import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { checkToken } from '#lib/api/auth.ts';
import { accessToken } from '#lib/stores/session.svelte.ts';
import { canSubmit } from '../canSubmit.ts';
import type { LoginState } from '../state.svelte.ts';

/** Form submit handler: checks the token with the server and signs in on success. */
export function createSubmit(state: LoginState) {
	return async function submit(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		if (!canSubmit(state)) return;
		const candidate = state.token.trim();
		state.checking = true;
		state.error = '';
		const result = await checkToken(candidate);
		state.checking = false;
		if (result === 'ok') {
			// Only a token the server accepted is ever persisted.
			accessToken.value = candidate;
			await goto(resolve('/'));
		} else {
			state.error =
				result === 'invalid' ? 'That token isn’t valid.' : 'Couldn’t reach the server. Try again.';
		}
	};
}
