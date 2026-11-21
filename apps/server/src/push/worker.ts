/// <reference lib="webworker" />
/**
 * Push notification worker (Bun Worker thread).
 * Sends Web Push messages off the main thread so webhook responses stay fast.
 */
import webpush from 'web-push';
import { env } from '../env.ts';
import type { PushJob, PushResult } from './types.ts';

declare const self: Worker;

if (env.vapidPublicKey && env.vapidPrivateKey) {
	webpush.setVapidDetails(env.vapidSubject, env.vapidPublicKey, env.vapidPrivateKey);
}

self.onmessage = async (event: MessageEvent<PushJob>) => {
	const { subscriptions, payload } = event.data;
	const body = JSON.stringify(payload);
	const expired: string[] = [];

	await Promise.all(
		subscriptions.map(async (sub) => {
			try {
				await webpush.sendNotification(sub, body);
			} catch (err) {
				const status = (err as { statusCode?: number }).statusCode;
				if (status === 404 || status === 410) expired.push(sub.endpoint);
				else console.error('[push] send failed', status, err);
			}
		})
	);

	self.postMessage({ expired } satisfies PushResult);
};
