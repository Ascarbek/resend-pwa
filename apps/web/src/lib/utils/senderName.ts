/** `Maya Chen <maya@x.com>` → `Maya Chen`; a bare address → its local part. */
export function senderName(from: string): string {
	const match = /^\s*"?([^"<]*?)"?\s*<([^>]+)>/.exec(from);
	const name = match?.[1]?.trim();
	if (name) return name;
	const address = (match?.[2] ?? from).trim();
	return address.split('@')[0] || address;
}
