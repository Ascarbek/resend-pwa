import { api } from './api/client.ts';

/**
 * Subscribes this device to Web Push and registers it with the server.
 * Call on every app launch: the server keeps subscriptions in memory only.
 */
export async function registerPush(): Promise<void> {
	if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
	if (Notification.permission === 'denied') return;

	const registration = await navigator.serviceWorker.ready;
	let subscription = await registration.pushManager.getSubscription();

	if (!subscription) {
		if ((await Notification.requestPermission()) !== 'granted') return;
		const { publicKey } = await api<{ publicKey: string }>('/push/public-key');
		if (!publicKey) return;
		subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: publicKey
		});
	}

	await api('/push/subscribe', { method: 'POST', body: JSON.stringify(subscription) });
}
