import type { LoginState } from '../state.svelte.ts';

/** Shows or hides the token in the input. */
export function createToggleVisible(state: LoginState) {
	return function toggleVisible(): void {
		state.visible = !state.visible;
	};
}
