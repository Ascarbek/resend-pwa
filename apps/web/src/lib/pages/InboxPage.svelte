<script lang="ts">
	// Inbox: hard-coded test data for now, no API wiring or interactions yet.
	import MagnifyingGlass from 'phosphor-svelte/lib/MagnifyingGlass';
	import PencilSimple from 'phosphor-svelte/lib/PencilSimple';

	type Email = {
		group: string;
		name: string;
		subject: string;
		preview: string;
		time: string;
		unread: boolean;
	};

	const emails: Email[] = [
		{
			name: 'Maya Chen',
			subject: 'Refund request for order #4821',
			preview: 'Hi there, I was charged twice for my annual plan last week and would like one…',
			group: 'Today',
			time: '9:41',
			unread: true
		},
		{
			name: 'Stripe',
			subject: 'Your payout of $1,240.00 is on the way',
			preview: 'A payout to your bank account ending in 4242 was initiated and should arrive…',
			group: 'Today',
			time: '8:15',
			unread: true
		},
		{
			name: 'Daniel Okafor',
			subject: 'Can’t log in after password reset',
			preview: 'The reset link worked but now the app keeps sending me back to the sign-in…',
			group: 'Today',
			time: '7:02',
			unread: true
		},
		{
			name: 'Lena Fischer',
			subject: 'Re: Feature request — dark mode export',
			preview: 'Thanks for the quick reply! That workaround does the job for now, but it would…',
			group: 'Yesterday',
			time: '18:47',
			unread: false
		},
		{
			name: 'GitHub',
			subject: '[serpin/app] New issue: Sync fails on iOS 19',
			preview: 'When the device goes to background during a sync the request is cancelled and…',
			group: 'Yesterday',
			time: '11:20',
			unread: false
		},
		{
			name: 'Arjun Patel',
			subject: 'Invoice for October',
			preview: 'Could you resend the October invoice with our new company address? We moved…',
			group: 'Nov 23',
			time: '16:05',
			unread: false
		},
		{
			name: 'Sofia Ramirez',
			subject: 'Partnership inquiry',
			preview: 'I run a small newsletter for indie developers and would love to feature serpin…',
			group: 'Nov 23',
			time: '10:32',
			unread: true
		},
		{
			name: 'Tom Becker',
			subject: 'Bug: attachments over 10 MB',
			preview: 'Uploading anything larger than about ten megabytes just spins forever, no error…',
			group: 'Nov 22',
			time: '21:14',
			unread: false
		},
		{
			name: 'Resend',
			subject: 'Your domain serpin.app is verified',
			preview: 'Great news! Your domain has been verified and you can now send and receive…',
			group: 'Nov 20',
			time: '14:58',
			unread: false
		},
		{
			name: 'Hana Suzuki',
			subject: 'Thank you!',
			preview: 'Just wanted to say the latest update is fantastic. The new search is so much…',
			group: 'Nov 20',
			time: '9:03',
			unread: false
		},
		{
			name: 'Marcus Lee',
			subject: 'Cancel subscription',
			preview: 'Please cancel my subscription at the end of the current billing period. Thanks…',
			group: 'Nov 18',
			time: '17:40',
			unread: false
		},
		{
			name: 'Priya Nair',
			subject: 'Question about team seats',
			preview: 'We are growing to 12 people next month. Is there a discount for teams above ten…',
			group: 'Nov 17',
			time: '12:26',
			unread: false
		}
	];

	// Consecutive emails with the same `group` label render under one divider.
	const groups = emails.reduce<{ label: string; emails: Email[] }[]>((acc, email) => {
		const last = acc.at(-1);
		if (last?.label === email.group) last.emails.push(email);
		else acc.push({ label: email.group, emails: [email] });
		return acc;
	}, []);

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
			<MagnifyingGlass size={20} weight="bold" />
		</div>
	</header>

	<!-- Email list -->
	<main class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
		<div class="pb-28">
			{#each groups as group (group.label)}
				<section>
					<div class="flex items-center gap-3 px-5 pt-5 pb-1">
						<h2 class="shrink-0 text-xs font-semibold tracking-[0.2em] text-stone-500 uppercase">
							{group.label}
						</h2>
						<div class="h-px flex-1 bg-stone-800"></div>
					</div>
					<ul>
						{#each group.emails as email (email.subject)}
							<li class="flex gap-3 px-5 py-4">
								<div
									class="flex size-11 shrink-0 items-center justify-center rounded-full border border-stone-700 bg-stone-800 text-sm font-semibold text-stone-300"
								>
									{initials(email.name)}
								</div>
								<div class="min-w-0 flex-1">
									<div class="flex items-baseline justify-between gap-3">
										<p
											class="truncate text-[15px] {email.unread
												? 'font-semibold text-white'
												: 'font-medium text-stone-300'}"
										>
											{email.name}
										</p>
										<span
											class="shrink-0 text-xs {email.unread
												? 'font-semibold text-amber-400'
												: 'text-stone-500'}"
										>
											{email.time}
										</span>
									</div>
									<p
										class="truncate text-sm {email.unread
											? 'font-medium text-stone-100'
											: 'text-stone-400'}"
									>
										{email.subject}
									</p>
									<p class="line-clamp-2 text-sm text-stone-500">{email.preview}</p>
								</div>
							</li>
						{/each}
					</ul>
				</section>
			{/each}
		</div>
	</main>

	<!-- Compose FAB -->
	<div
		class="fixed right-5 bottom-[max(env(safe-area-inset-bottom),1.25rem)] flex size-14 items-center justify-center rounded-full border border-amber-900 bg-amber-950 text-amber-400 shadow-lg shadow-black/40"
		aria-label="Compose"
	>
		<PencilSimple size={24} weight="bold" />
	</div>
</div>
