import type { EmailSummary } from '#lib/api/emails.ts';

/** All mutable state of the inbox page. Actions receive this object and mutate it. */
export type InboxState = {
	emails: EmailSummary[];
	hasMore: boolean;
	loading: boolean;
	error: string;
};

export function createInboxState(initial: Partial<InboxState> = {}): InboxState {
	return $state<InboxState>({
		emails: [],
		hasMore: true,
		loading: false,
		error: '',
		...initial
	});
}
