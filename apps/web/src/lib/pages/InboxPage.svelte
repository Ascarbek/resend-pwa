<script lang="ts">
	import { onMount } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import { prefersReducedMotion } from 'svelte/motion';
	import { fade, fly } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import MagnifyingGlassIcon from 'phosphor-svelte/lib/MagnifyingGlassIcon';
	import PencilSimpleIcon from 'phosphor-svelte/lib/PencilSimpleIcon';
	import { ApiError } from '#lib/api/client.ts';
	import { listEmails, type EmailSummary } from '#lib/api/emails.ts';
	import { accessToken } from '#lib/stores/session.svelte.ts';

	type Row = EmailSummary & { name: string; date: Date };

	let emails = $state<EmailSummary[]>([]);
	let hasMore = $state(true);
	let loading = $state(false);
	let error = $state('');

	const duration = $derived(prefersReducedMotion.current ? 0 : 200);

	/** Fetches the next page from the server (cursor = last loaded id) and appends it. */
	async function loadMore() {
		if (loading || !hasMore) return;
		loading = true;
		error = '';
		try {
			const page = await listEmails(emails.at(-1)?.id);
			const seen = new Set(emails.map((email) => email.id));
			emails.push(...page.emails.filter((email) => !seen.has(email.id)));
			hasMore = page.has_more;
		} catch (err) {
			if (err instanceof ApiError && err.status === 401) {
				// Token no longer accepted (rotated on the server): sign in again.
				accessToken.value = '';
				await goto(resolve('/login'));
				return;
			}
			error =
				err instanceof ApiError && err.status === 429
					? 'Resend is rate limiting us. Try again in a moment.'
					: 'Couldn’t load emails.';
		} finally {
			loading = false;
		}
	}

	onMount(loadMore);

	/** Loads the next page whenever the sentinel below the list scrolls into view. */
	const infiniteScroll: Attachment<HTMLElement> = (node) => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting) && !error) void loadMore();
			},
			{ rootMargin: '400px' }
		);
		observer.observe(node);
		return () => observer.disconnect();
	};

	const rows = $derived(
		emails.map<Row>((email) => ({
			...email,
			name: senderName(email.from),
			date: parseDate(email.created_at)
		}))
	);

	// Consecutive emails from the same day render under one divider (list is newest first).
	const groups = $derived(
		rows.reduce<{ label: string; emails: Row[] }[]>((acc, email) => {
			const label = dayLabel(email.date);
			const last = acc.at(-1);
			if (last?.label === label) last.emails.push(email);
			else acc.push({ label, emails: [email] });
			return acc;
		}, [])
	);

	/** `Maya Chen <maya@x.com>` → `Maya Chen`; a bare address → its local part. */
	function senderName(from: string): string {
		const match = /^\s*"?([^"<]*?)"?\s*<([^>]+)>/.exec(from);
		const name = match?.[1]?.trim();
		if (name) return name;
		const address = (match?.[2] ?? from).trim();
		return address.split('@')[0] || address;
	}

	/** Resend timestamps look like `2026-11-24 09:41:00.123+00`, which Safari can't parse as-is. */
	function parseDate(value: string): Date {
		const iso = value.replace(' ', 'T').replace(/([+-]\d{2})$/, '$1:00');
		const date = new Date(iso);
		return Number.isNaN(date.getTime()) ? new Date(value) : date;
	}

	function dayLabel(date: Date): string {
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

	function time(date: Date): string {
		return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
	}

	function initials(name: string): string {
		const parts = name.trim().split(/\s+/);
		return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
	}
</script>

<svelte:head>
	<title>Inbox</title>
</svelte:head>

<div class="flex h-dvh flex-col bg-stone-950 text-stone-100 antialiased">
	<!-- Header -->
	<header
		class="flex shrink-0 items-end justify-between px-5 pt-[max(env(safe-area-inset-top),1rem)] pb-4"
	>
		<div class="min-w-0">
			<p class="mb-1.5 truncate text-xs font-medium tracking-wider text-stone-500">
				support@serpin.app
			</p>
			<h1 class="text-4xl font-bold tracking-tight text-white">Inbox</h1>
		</div>
		<div
			class="flex size-11 shrink-0 items-center justify-center rounded-full border border-stone-700 bg-stone-900 text-stone-300"
			aria-label="Search"
		>
			<MagnifyingGlassIcon size={20} weight="bold" />
		</div>
	</header>

	<!-- Email list -->
	<main class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
		<div class="pb-28">
			{#each groups as group (group.label)}
				<section in:fade={{ duration }}>
					<div class="flex items-center gap-3 px-5 pt-5 pb-1">
						<h2 class="shrink-0 text-xs font-semibold tracking-[0.2em] text-stone-500 uppercase">
							{group.label}
						</h2>
						<div class="h-px flex-1 bg-stone-800"></div>
					</div>
					<ul>
						{#each group.emails as email (email.id)}
							<li class="flex gap-3 px-5 py-4" in:fly={{ y: 8, duration }}>
								<div
									class="flex size-11 shrink-0 items-center justify-center rounded-full border border-stone-700 bg-stone-800 text-sm font-semibold text-stone-300"
								>
									{initials(email.name)}
								</div>
								<div class="min-w-0 flex-1">
									<div class="flex items-baseline justify-between gap-3">
										<p class="truncate text-[15px] font-semibold text-white">{email.name}</p>
										<time
											datetime={email.date.toISOString()}
											class="shrink-0 text-xs text-stone-500"
										>
											{time(email.date)}
										</time>
									</div>
									<p class="truncate text-sm text-stone-300">
										{email.subject || '(no subject)'}
									</p>
								</div>
							</li>
						{/each}
					</ul>
				</section>
			{/each}

			{#if error}
				<div class="flex flex-col items-center gap-3 px-5 py-10 text-center" in:fade={{ duration }}>
					<p class="text-sm text-stone-400">{error}</p>
					<button
						type="button"
						onclick={loadMore}
						class="rounded-full border border-stone-700 bg-stone-900 px-5 py-2.5 text-sm font-semibold text-stone-200"
					>
						Retry
					</button>
				</div>
			{:else if loading}
				<p class="px-5 py-10 text-center text-sm text-stone-500" in:fade={{ duration }}>Loading…</p>
			{:else if !hasMore && emails.length === 0}
				<p class="px-5 py-16 text-center text-sm text-stone-500" in:fade={{ duration }}>
					No emails yet.
				</p>
			{/if}

			{#if hasMore && emails.length > 0}
				<div {@attach infiniteScroll} class="h-px"></div>
			{/if}
		</div>
	</main>

	<!-- Compose FAB -->
	<div
		class="fixed right-5 bottom-[max(env(safe-area-inset-bottom),1.25rem)] flex size-14 items-center justify-center rounded-full border border-amber-900 bg-amber-950 text-amber-400 shadow-lg shadow-black/40"
		aria-label="Compose"
	>
		<PencilSimpleIcon size={24} weight="bold" />
	</div>
</div>
