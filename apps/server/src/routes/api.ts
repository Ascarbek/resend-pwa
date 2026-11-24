import { createHash, timingSafeEqual } from 'node:crypto';
import type { PushSubscription } from 'web-push';
import { env } from '../env.ts';
import { addSubscription, removeSubscription } from '../push/subscriptions.ts';

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
	}
	// TODO: /api/emails (list/get received + sent, send) proxying the Resend API.
};
