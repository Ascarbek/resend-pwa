import { Resend } from 'resend';
import { env } from '../env.ts';

let client: Resend | undefined;

/**
 * Shared Resend SDK instance, created lazily so the server can boot without a key
 * (the SDK constructor throws when the key is missing).
 * Resend is the only persistent store for email data.
 */
export function getResend(): Resend {
	return (client ??= new Resend(env.resendApiKey));
}
