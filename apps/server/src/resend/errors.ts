/** Maps a Resend SDK error to a response, keeping rate limits visible to the PWA. */
export function resendError(error: { message: string; statusCode: number | null }): Response {
	console.error(`[resend] ${error.statusCode ?? '?'}: ${error.message}`);
	const status = error.statusCode === 429 ? 429 : 502;
	return Response.json({ error: error.message }, { status });
}
