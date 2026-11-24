import { createHash, timingSafeEqual } from 'node:crypto';
import type { PushSubscription } from 'web-push';
import { env } from '../env.ts';
import { addSubscription, removeSubscription } from '../push/subscriptions.ts';
import { getResend } from '../resend/client.ts';

/** Returns a 401 response unless the request carries `Authorization: Bearer <ACCESS_TOKEN>`. */
export function requireAuth(req: Request): Response | null {
	const header = req.headers.get('authorization') ?? '';
	if (env.accessToken && tokensMatch(header, `Bearer ${env.accessToken}`)) return null;
	return Response.json({ error: 'unauthorized' }, { status: 401 });
}

/** Constant-time comparison; hashing first makes both inputs the same length. */
function tokensMatch(a: string, b: string): boolean {
	const hash = (value: string) => createHash('sha256').update(value).digest();
	return timingSafeEqual(hash(a), hash(b));
}

/** Wraps a handler so it only runs for authenticated requests. */
export function authed(handler: (req: Request) => Response | Promise<Response>) {
	return (req: Request) => requireAuth(req) ?? handler(req);
}

export const apiRoutes = {
	/** Lets the PWA validate a token before saving it: 204 if valid, 401 otherwise. */
	'/api/auth/check': {
		GET: authed(() => new Response(null, { status: 204 }))
	},
	'/api/push/public-key': {
		GET: () => Response.json({ publicKey: env.vapidPublicKey })
	},
	'/api/push/subscribe': {
		POST: authed(async (req) => {
			await addSubscription((await req.json()) as PushSubscription);
			return new Response(null, { status: 204 });
		}),
		DELETE: authed(async (req) => {
			const { endpoint } = (await req.json()) as { endpoint: string };
			await removeSubscription(endpoint);
			return new Response(null, { status: 204 });
		})
	},
	/**
	 * One page of received emails, newest first (Resend's cursor pagination).
	 * Query: `limit` (1-100, default 50), `after` (id of the last email of the previous page).
	 */
	'/api/emails': {
		GET: authed(async (req) => {
			const params = new URL(req.url).searchParams;
			const limit = Math.min(Math.max(Number(params.get('limit')) || 50, 1), 100);
			const after = params.get('after') || undefined;

			const { data, error } = await getResend().emails.receiving.list({ limit, after });
			if (error) return resendError(error);

			return Response.json({
				emails: data.data.map((email) => ({
					id: email.id,
					from: email.from,
					subject: email.subject,
					created_at: email.created_at,
					attachments: email.attachments.length
				})),
				has_more: data.has_more
			});
		})
	}
	// TODO: get one email, sent emails, send, reply.
};

/** Maps a Resend SDK error to a response, keeping rate limits visible to the PWA. */
function resendError(error: { message: string; statusCode: number | null }): Response {
	console.error(`[resend] ${error.statusCode ?? '?'}: ${error.message}`);
	const status = error.statusCode === 429 ? 429 : 502;
	return Response.json({ error: error.message }, { status });
}
