import { env } from '../env.ts';

/** The VAPID public key the PWA needs to create a push subscription. */
export function pushPublicKey(): Response {
	return Response.json({ publicKey: env.vapidPublicKey });
}
