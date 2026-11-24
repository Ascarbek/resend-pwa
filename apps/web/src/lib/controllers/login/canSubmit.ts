import type { LoginState } from './state.svelte.ts';

/** A token has been entered and no check is in flight. */
export function canSubmit(state: LoginState): boolean {
	return state.token.trim().length > 0 && !state.checking;
}
