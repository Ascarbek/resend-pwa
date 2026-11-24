/** Resend timestamps look like `2026-11-24 09:41:00.123+00`, which Safari can't parse as-is. */
export function parseDate(value: string): Date {
	const iso = value.replace(' ', 'T').replace(/([+-]\d{2})$/, '$1:00');
	const date = new Date(iso);
	return Number.isNaN(date.getTime()) ? new Date(value) : date;
}
