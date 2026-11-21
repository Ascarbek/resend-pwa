/** Centralised, typed access to environment variables. Bun loads `.env` via `--env-file`. */
function optional(name: string, fallback = ''): string {
	return process.env[name] ?? fallback;
}

export const env = {
	port: Number(optional('PORT', '3000')),
	staticDir: optional('STATIC_DIR', '../web/build'),
	/** JSON file for server-side state; relative paths resolve from apps/server. */
	dataFile: optional('DATA_FILE', '../../data.json'),
	accessToken: optional('ACCESS_TOKEN'),
	resendApiKey: optional('RESEND_API_KEY'),
	resendWebhookSecret: optional('RESEND_WEBHOOK_SECRET'),
	mailFrom: optional('MAIL_FROM'),
	vapidPublicKey: optional('VAPID_PUBLIC_KEY'),
	vapidPrivateKey: optional('VAPID_PRIVATE_KEY'),
	vapidSubject: optional('VAPID_SUBJECT', 'mailto:admin@example.com')
} as const;

const required = ['ACCESS_TOKEN', 'RESEND_API_KEY', 'RESEND_WEBHOOK_SECRET'] as const;
const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
	console.warn(`[env] missing: ${missing.join(', ')} — related features will not work`);
}
