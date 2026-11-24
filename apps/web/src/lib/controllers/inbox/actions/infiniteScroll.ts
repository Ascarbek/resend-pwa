import type { Attachment } from 'svelte/attachments';
import type { InboxState } from '../state.svelte.ts';
import { createLoadMore } from './loadMore.ts';

/** Attachment that loads the next page whenever its node (a sentinel below the list) scrolls into view. */
export function createInfiniteScroll(state: InboxState): Attachment<HTMLElement> {
	const loadMore = createLoadMore(state);
	return (node) => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting) && !state.error) void loadMore();
			},
			{ rootMargin: '400px' }
		);
		observer.observe(node);
		return () => observer.disconnect();
	};
}
