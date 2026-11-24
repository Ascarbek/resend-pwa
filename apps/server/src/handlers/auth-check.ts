/** Lets the PWA validate a token before saving it: 204 if valid, 401 otherwise (via `authed`). */
export function authCheck(): Response {
	return new Response(null, { status: 204 });
}
