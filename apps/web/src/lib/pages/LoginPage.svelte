<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { prefersReducedMotion } from 'svelte/motion';
	import { fade, slide } from 'svelte/transition';
	import Eye from 'phosphor-svelte/lib/Eye';
	import EyeSlash from 'phosphor-svelte/lib/EyeSlash';
	import { accessToken } from '#lib/stores/session.svelte.ts';

	let token = $state('');
	let visible = $state(false);
	let checking = $state(false);
	let error = $state('');

	const canSubmit = $derived(token.trim().length > 0 && !checking);
	const duration = $derived(prefersReducedMotion.current ? 0 : 150);

	/** Asks the server whether `candidate` is the right ACCESS_TOKEN. */
	async function check(candidate: string): Promise<'ok' | 'invalid' | 'unreachable'> {
		try {
			const res = await fetch('/api/auth/check', {
				headers: { authorization: `Bearer ${candidate}` }
			});
			if (res.ok) return 'ok';
			return res.status === 401 ? 'invalid' : 'unreachable';
		} catch {
			return 'unreachable';
		}
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!canSubmit) return;
		const candidate = token.trim();
		checking = true;
		error = '';
		const result = await check(candidate);
		checking = false;
		if (result === 'ok') {
			// Only a token the server accepted is ever persisted.
			accessToken.value = candidate;
			await goto(resolve('/'));
		} else {
			error =
				result === 'invalid' ? 'That token isn’t valid.' : 'Couldn’t reach the server. Try again.';
		}
	}
</script>

<svelte:head>
	<title>Sign in</title>
</svelte:head>

<div class="flex min-h-dvh flex-col bg-stone-950 text-stone-100 antialiased">
	<header class="px-5 pt-[max(env(safe-area-inset-top),1rem)] pb-4">
		<p class="mb-1.5 text-xs font-medium tracking-wider text-stone-500">Resend PWA</p>
		<h1 class="text-4xl font-bold tracking-tight text-white">Sign in</h1>
	</header>

	<form class="flex flex-col gap-4 px-5 pt-4" onsubmit={submit}>
		<label class="flex flex-col gap-2">
			<span class="text-xs font-semibold tracking-[0.2em] text-stone-500 uppercase">
				Access token
			</span>
			<div class="relative">
				<input
					type={visible ? 'text' : 'password'}
					bind:value={token}
					oninput={() => (error = '')}
					aria-invalid={error ? true : undefined}
					aria-describedby={error ? 'token-error' : undefined}
					name="access-token"
					autocomplete="current-password"
					autocapitalize="off"
					autocorrect="off"
					spellcheck="false"
					placeholder="Paste your token"
					class="w-full rounded-2xl border border-stone-700 bg-stone-900 py-3.5 pr-14 pl-4 font-mono text-base text-white transition-colors duration-150 placeholder:font-sans placeholder:text-stone-600 focus:border-amber-900 focus:ring-0 focus:outline-none aria-invalid:border-red-900 motion-reduce:transition-none"
				/>
				<button
					type="button"
					onclick={() => (visible = !visible)}
					aria-label={visible ? 'Hide token' : 'Show token'}
					aria-pressed={visible}
					class="absolute inset-y-0 right-1.5 my-auto flex size-11 items-center justify-center rounded-full text-stone-400"
				>
					{#key visible}
						<span class="absolute" in:fade={{ duration }} out:fade={{ duration }}>
							{#if visible}
								<EyeSlash size={20} weight="bold" />
							{:else}
								<Eye size={20} weight="bold" />
							{/if}
						</span>
					{/key}
				</button>
			</div>
		</label>

		{#if error}
			<p
				id="token-error"
				role="alert"
				class="text-sm font-medium text-red-400"
				transition:slide={{ duration }}
			>
				{error}
			</p>
		{/if}

		<p class="text-sm text-stone-500">
			The <code class="font-mono text-stone-400">ACCESS_TOKEN</code> from your server's
			<code class="font-mono text-stone-400">.env</code>. It's stored only on this device.
		</p>

		<button
			type="submit"
			disabled={!canSubmit}
			class="mt-2 h-14 rounded-full border border-amber-900 bg-amber-950 text-base font-semibold text-amber-400 transition-opacity duration-150 disabled:opacity-40 motion-reduce:transition-none"
		>
			{checking ? 'Checking…' : 'Sign in'}
		</button>
	</form>
</div>
