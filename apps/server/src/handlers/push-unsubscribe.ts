import { removeSubscription } from '../push/subscriptions.ts';

/** Removes the push subscription whose `endpoint` is in the request body. */
export async function pushUnsubscribe(req: Request): Promise<Response> {
	const { endpoint } = (await req.json()) as { endpoint: string };
	await removeSubscription(endpoint);
	return new Response(null, { status: 204 });
}
