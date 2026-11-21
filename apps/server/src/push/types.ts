import type { PushSubscription } from 'web-push';

/** Payload delivered to the service worker's `push` event. */
export interface PushPayload {
	title: string;
	body: string;
	/** In-app route to open on notification click, e.g. `/inbox/<email_id>`. */
	url?: string;
	tag?: string;
}

/** Message posted from the main thread to the push worker. */
export interface PushJob {
	subscriptions: PushSubscription[];
	payload: PushPayload;
}

/** Message posted back from the push worker. */
export interface PushResult {
	/** Endpoints that returned 404/410 and should be dropped. */
	expired: string[];
}
