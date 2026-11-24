import { prefersReducedMotion } from 'svelte/motion';
import { createSetToken } from './actions/setToken.ts';
import { createSubmit } from './actions/submit.ts';
import { createToggleVisible } from './actions/toggleVisible.ts';
import { canSubmit } from './canSubmit.ts';
import { createLoginState, type LoginState } from './state.svelte.ts';

/**
 * Login page controller: owns the page state, derived values and actions.
 * Read members through the returned object (`login.token`), never destructure it,
 * or the getters lose reactivity.
 */
export function createLoginController(initial?: Partial<LoginState>) {
	const state = createLoginState(initial);

	const submittable = $derived(canSubmit(state));
	const duration = $derived(prefersReducedMotion.current ? 0 : 150);

	return {
		get token() {
			return state.token;
		},
		get visible() {
			return state.visible;
		},
		get checking() {
			return state.checking;
		},
		get error() {
			return state.error;
		},
		get canSubmit() {
			return submittable;
		},
		get duration() {
			return duration;
		},
		setToken: createSetToken(state),
		toggleVisible: createToggleVisible(state),
		submit: createSubmit(state)
	};
}
