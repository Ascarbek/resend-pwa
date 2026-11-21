import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// The Bun server (apps/server) serves the built PWA in production.
// In dev, Vite proxies API/webhook calls to it.
const serverUrl = process.env.SERVER_URL ?? 'http://localhost:3000';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// SPA mode: no SSR, every unknown route falls back to index.html.
			adapter: adapter({ fallback: 'index.html' })
		})
	],
	server: {
		proxy: {
			'/api': serverUrl,
			'/webhooks': serverUrl
		}
	}
});
