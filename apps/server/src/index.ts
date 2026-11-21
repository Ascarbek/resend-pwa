import { env } from './env.ts';
import { apiRoutes } from './routes/api.ts';
import { serveStatic } from './routes/static.ts';
import { handleResendWebhook } from './routes/webhook.ts';

const server = Bun.serve({
	port: env.port,
	routes: {
		'/health': new Response('ok'),
		'/webhooks/resend': { POST: handleResendWebhook },
		...apiRoutes,
		'/api/*': Response.json({ error: 'not found' }, { status: 404 })
	},
	fetch: serveStatic,
	error(err) {
		console.error(err);
		return Response.json({ error: 'internal error' }, { status: 500 });
	}
});

console.log(`resend-pwa server listening on ${server.url}`);
