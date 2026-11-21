import { self as sw } from '$app/service-worker';
import { assets, immutable } from '$app/manifest';
import { version } from '$app/env';

const CACHE = `cache-${version}`;
const ASSETS = [...immutable, ...assets].map(({ path }) => `/${path.replace(/^\//, '')}`);

// --- App shell caching ------------------------------------------------------

sw.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll([...ASSETS, '/'])));
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
	);
});

sw.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);
	if (event.request.method !== 'GET' || url.origin !== sw.location.origin) return;
	// Never cache API data — Resend is the source of truth.
	if (url.pathname.startsWith('/api/')) return;

	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);
			if (ASSETS.includes(url.pathname)) {
				const cached = await cache.match(url.pathname);
				if (cached) return cached;
			}
			try {
				return await fetch(event.request);
			} catch {
				// Offline navigation: serve the SPA shell.
				return (await cache.match('/')) ?? Response.error();
			}
		})()
	);
});

// --- Push notifications -----------------------------------------------------

interface PushPayload {
	title: string;
	body: string;
	url?: string;
	tag?: string;
}

sw.addEventListener('push', (event) => {
	const data = (event.data?.json() ?? { title: 'New email', body: '' }) as PushPayload;
	event.waitUntil(
		sw.registration.showNotification(data.title, {
			body: data.body,
			tag: data.tag,
			icon: '/icon.svg',
			data: { url: data.url ?? '/' }
		})
	);
});

sw.addEventListener('notificationclick', (event) => {
	event.notification.close();
	const url = (event.notification.data as { url: string }).url;
	event.waitUntil(
		(async () => {
			const windows = await sw.clients.matchAll({ type: 'window', includeUncontrolled: true });
			const existing = windows[0];
			if (existing) {
				await existing.navigate(url);
				await existing.focus();
			} else {
				await sw.clients.openWindow(url);
			}
		})()
	);
});
