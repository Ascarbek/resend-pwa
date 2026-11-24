/** Locale time of day, e.g. `9:41 AM`. */
export function time(date: Date): string {
	return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}
