/** `Today`, `Yesterday`, or a short date (with the year only when it isn't the current one). */
export function dayLabel(date: Date): string {
	const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
	const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86_400_000);
	if (days === 0) return 'Today';
	if (days === 1) return 'Yesterday';
	const sameYear = date.getFullYear() === new Date().getFullYear();
	return date.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		year: sameYear ? undefined : 'numeric'
	});
}
