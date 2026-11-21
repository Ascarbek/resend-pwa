import type { PushSubscription } from 'web-push';
import { read, update } from '../store.ts';

/**
 * Push subscriptions, persisted in data.json (see ../store.ts).
 * Keyed by endpoint: re-subscribing the same device replaces its entry.
 */

export function addSubscription(sub: PushSubscription): Promise<void> {
	return update((d) => {
		d.pushSubscriptions = d.pushSubscriptions.filter((s) => s.endpoint !== sub.endpoint);
		d.pushSubscriptions.push(sub);
	});
}

export function removeSubscription(endpoint: string): Promise<void> {
	return update((d) => {
		d.pushSubscriptions = d.pushSubscriptions.filter((s) => s.endpoint !== endpoint);
	});
}

export function listSubscriptions(): PushSubscription[] {
	return [...read().pushSubscriptions];
}
