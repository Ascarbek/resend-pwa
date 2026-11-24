import { getResend } from '../resend/client.ts';
import { resendError } from '../resend/errors.ts';

/**
 * One page of received emails, newest first (Resend's cursor pagination).
 * Query: `limit` (1-100, default 50), `after` (id of the last email of the previous page).
 */
export async function listEmails(req: Request): Promise<Response> {
	const params = new URL(req.url).searchParams;
	const limit = Math.min(Math.max(Number(params.get('limit')) || 50, 1), 100);
	const after = params.get('after') || undefined;

	const { data, error } = await getResend().emails.receiving.list({ limit, after });
	if (error) return resendError(error);

	return Response.json({
		emails: data.data.map((email) => ({
			id: email.id,
			from: email.from,
			subject: email.subject,
			created_at: email.created_at,
			attachments: email.attachments.length
		})),
		has_more: data.has_more
	});
}
