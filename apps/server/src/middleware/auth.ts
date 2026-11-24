import { createHash, timingSafeEqual } from 'node:crypto';
import { env } from '../env.ts';

type Handler = (req: Request) => Response | Promise<Response>;

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
export function authed(handler: Handler): Handler {
	return (req: Request) => requireAuth(req) ?? handler(req);
}
