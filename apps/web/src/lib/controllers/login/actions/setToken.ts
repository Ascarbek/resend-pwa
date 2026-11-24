import type { LoginState } from '../state.svelte.ts';

/** Updates the token as the user types and clears any previous error. */
export function createSetToken(state: LoginState) {
	return function setToken(value: string): void {
		state.token = value;
		state.error = '';
	};
}
