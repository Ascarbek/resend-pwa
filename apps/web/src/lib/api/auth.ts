import { api, ApiError } from './client.ts';

export type TokenCheck = 'ok' | 'invalid' | 'unreachable';

/** Asks the server whether `candidate` is the right ACCESS_TOKEN, without persisting it. */
export async function checkToken(candidate: string): Promise<TokenCheck> {
	try {
		await api<void>('/auth/check', { headers: { authorization: `Bearer ${candidate}` } });
		return 'ok';
	} catch (err) {
		return err instanceof ApiError && err.status === 401 ? 'invalid' : 'unreachable';
	}
}
