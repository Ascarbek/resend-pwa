import { env } from '../env.ts';
import { notifyAll } from '../push/index.ts';
import { getResend } from '../resend/client.ts';

/** POST /webhooks/resend — receives signed (Svix) webhook events from Resend. */
export async function handleResendWebhook(req: Request): Promise<Response> {
	const payload = await req.text();

	let event;
	try {
		event = getResend().webhooks.verify({
			payload,
			headers: {
				id: req.headers.get('svix-id') ?? '',
				timestamp: req.headers.get('svix-timestamp') ?? '',
				signature: req.headers.get('svix-signature') ?? ''
			},
			webhookSecret: env.resendWebhookSecret
		});
	} catch {
		return new Response('invalid signature', { status: 400 });
	}

	switch (event.type) {
		case 'email.received':
			notifyAll({
				title: event.data.from,
				body: event.data.subject || '(no subject)',
				url: `/inbox/${event.data.email_id}`,
				tag: event.data.email_id
			});
			break;
		default:
			// Other events (delivered, bounced, ...) are ignored for now.
			break;
	}

	return new Response(null, { status: 204 });
}
