import { join, resolve, sep } from 'node:path';
import { env } from '../env.ts';

const root = resolve(env.staticDir);

/** Serves the built PWA, falling back to index.html for client-side routes (SPA mode). */
export async function serveStatic(req: Request): Promise<Response> {
	const { pathname } = new URL(req.url);
	const filePath = resolve(join(root, decodeURIComponent(pathname)));
	if (filePath !== root && !filePath.startsWith(root + sep))
		return new Response('forbidden', { status: 403 });

	const file = Bun.file(filePath);
	if ((await file.exists()) && !pathname.endsWith('/')) return new Response(file);

	const index = Bun.file(join(root, 'index.html'));
	if (await index.exists()) return new Response(index);
	return new Response('PWA not built. Run `bun run build`.', { status: 404 });
}
