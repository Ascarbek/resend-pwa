import { prefersReducedMotion } from 'svelte/motion';
import type { EmailSummary } from '#lib/api/emails.ts';
import { dayLabel } from '#lib/utils/dayLabel.ts';
import { initials } from '#lib/utils/initials.ts';
import { parseDate } from '#lib/utils/parseDate.ts';
import { senderName } from '#lib/utils/senderName.ts';
import { time } from '#lib/utils/time.ts';
import { createInfiniteScroll } from './actions/infiniteScroll.ts';
import { createLoadMore } from './actions/loadMore.ts';
import { createInboxState, type InboxState } from './state.svelte.ts';

export type InboxRow = EmailSummary & { name: string; initials: string; date: Date; time: string };
export type InboxGroup = { label: string; emails: InboxRow[] };

/**
 * Inbox page controller: owns the page state, derived values and actions.
 * Read members through the returned object (`inbox.emails`), never destructure it,
 * or the getters lose reactivity.
 */
export function createInboxController(initial?: Partial<InboxState>) {
	const state = createInboxState(initial);

	const duration = $derived(prefersReducedMotion.current ? 0 : 200);

	const rows = $derived(
		state.emails.map<InboxRow>((email) => {
			const name = senderName(email.from);
			const date = parseDate(email.created_at);
			return { ...email, name, initials: initials(name), date, time: time(date) };
		})
	);

	// Consecutive emails from the same day render under one divider (list is newest first).
	const groups = $derived(
		rows.reduce<InboxGroup[]>((acc, email) => {
			const label = dayLabel(email.date);
			const last = acc.at(-1);
			if (last?.label === label) last.emails.push(email);
			else acc.push({ label, emails: [email] });
			return acc;
		}, [])
	);

	return {
		get emails() {
			return state.emails;
		},
		get hasMore() {
			return state.hasMore;
		},
		get loading() {
			return state.loading;
		},
		get error() {
			return state.error;
		},
		get duration() {
			return duration;
		},
		get groups() {
			return groups;
		},
		loadMore: createLoadMore(state),
		infiniteScroll: createInfiniteScroll(state)
	};
}
