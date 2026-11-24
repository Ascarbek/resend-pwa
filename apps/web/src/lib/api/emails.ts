import { api } from './client.ts';

/** A received email as listed by `GET /api/emails` (metadata only, no body). */
export type EmailSummary = {
	id: string;
	/** Raw From header, e.g. `Maya Chen <maya@example.com>`. */
	from: string;
	subject: string;
	created_at: string;
	attachments: number;
};

export type EmailPage = { emails: EmailSummary[]; has_more: boolean };

/** One page of received emails, newest first. Pass the last id of the previous page as `after`. */
export function listEmails(after?: string, limit = 50): Promise<EmailPage> {
	const params = new URLSearchParams({ limit: String(limit) });
	if (after) params.set('after', after);
	return api<EmailPage>(`/emails?${params}`);
}
