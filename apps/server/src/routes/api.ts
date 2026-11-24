import { authCheck } from '../handlers/auth-check.ts';
import { listEmails } from '../handlers/list-emails.ts';
import { pushPublicKey } from '../handlers/push-public-key.ts';
import { pushSubscribe } from '../handlers/push-subscribe.ts';
import { pushUnsubscribe } from '../handlers/push-unsubscribe.ts';
import { authed } from '../middleware/auth.ts';

export const apiRoutes = {
	'/api/auth/check': { GET: authed(authCheck) },
	'/api/push/public-key': { GET: pushPublicKey },
	'/api/push/subscribe': { POST: authed(pushSubscribe), DELETE: authed(pushUnsubscribe) },
	'/api/emails': { GET: authed(listEmails) }
	// TODO: get one email, sent emails, send, reply.
};
