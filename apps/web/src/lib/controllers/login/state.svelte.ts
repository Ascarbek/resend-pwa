/** All mutable state of the login page. Actions receive this object and mutate it. */
export type LoginState = {
	token: string;
	visible: boolean;
	checking: boolean;
	error: string;
};

export function createLoginState(initial: Partial<LoginState> = {}): LoginState {
	return $state<LoginState>({
		token: '',
		visible: false,
		checking: false,
		error: '',
		...initial
	});
}
