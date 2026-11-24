<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import MagnifyingGlassIcon from 'phosphor-svelte/lib/MagnifyingGlassIcon';
	import PencilSimpleIcon from 'phosphor-svelte/lib/PencilSimpleIcon';
	import { createInboxController } from '#lib/controllers/inbox/controller.svelte.ts';

	const inbox = createInboxController();

	onMount(inbox.loadMore);
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
			{#each inbox.groups as group (group.label)}
				<section in:fade={{ duration: inbox.duration }}>
					<div class="flex items-center gap-3 px-5 pt-5 pb-1">
						<h2 class="shrink-0 text-xs font-semibold tracking-[0.2em] text-stone-500 uppercase">
							{group.label}
						</h2>
						<div class="h-px flex-1 bg-stone-800"></div>
					</div>
					<ul>
						{#each group.emails as email (email.id)}
							<li class="flex gap-3 px-5 py-4" in:fly={{ y: 8, duration: inbox.duration }}>
								<div
									class="flex size-11 shrink-0 items-center justify-center rounded-full border border-stone-700 bg-stone-800 text-sm font-semibold text-stone-300"
								>
									{email.initials}
								</div>
								<div class="min-w-0 flex-1">
									<div class="flex items-baseline justify-between gap-3">
										<p class="truncate text-[15px] font-semibold text-white">{email.name}</p>
										<time
											datetime={email.date.toISOString()}
											class="shrink-0 text-xs text-stone-500"
										>
											{email.time}
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

			{#if inbox.error}
				<div
					class="flex flex-col items-center gap-3 px-5 py-10 text-center"
					in:fade={{ duration: inbox.duration }}
				>
					<p class="text-sm text-stone-400">{inbox.error}</p>
					<button
						type="button"
						onclick={inbox.loadMore}
						class="rounded-full border border-stone-700 bg-stone-900 px-5 py-2.5 text-sm font-semibold text-stone-200"
					>
						Retry
					</button>
				</div>
			{:else if inbox.loading}
				<p
					class="px-5 py-10 text-center text-sm text-stone-500"
					in:fade={{ duration: inbox.duration }}
				>
					Loading…
				</p>
			{:else if !inbox.hasMore && inbox.emails.length === 0}
				<p
					class="px-5 py-16 text-center text-sm text-stone-500"
					in:fade={{ duration: inbox.duration }}
				>
					No emails yet.
				</p>
			{/if}

			{#if inbox.hasMore && inbox.emails.length > 0}
				<div {@attach inbox.infiniteScroll} class="h-px"></div>
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
