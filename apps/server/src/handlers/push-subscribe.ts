import type { PushSubscription } from 'web-push';
import { addSubscription } from '../push/subscriptions.ts';

/** Stores the push subscription in the request body. */
export async function pushSubscribe(req: Request): Promise<Response> {
	await addSubscription((await req.json()) as PushSubscription);
	return new Response(null, { status: 204 });
}
