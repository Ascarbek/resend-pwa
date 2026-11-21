import { listSubscriptions, removeSubscription } from './subscriptions.ts';
import type { PushPayload, PushResult } from './types.ts';

const worker = new Worker(new URL('./worker.ts', import.meta.url).href);

worker.onmessage = (event: MessageEvent<PushResult>) => {
	for (const endpoint of event.data.expired) void removeSubscription(endpoint);
};

/** Fan a notification out to every registered device via the push worker. */
export function notifyAll(payload: PushPayload): void {
	const subscriptions = listSubscriptions();
	if (subscriptions.length === 0) return;
	worker.postMessage({ subscriptions, payload });
}
