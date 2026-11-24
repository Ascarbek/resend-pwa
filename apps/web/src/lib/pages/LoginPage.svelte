<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import EyeIcon from 'phosphor-svelte/lib/EyeIcon';
	import EyeSlashIcon from 'phosphor-svelte/lib/EyeSlashIcon';
	import { createLoginController } from '#lib/controllers/login/controller.svelte.ts';

	const login = createLoginController();
</script>

<svelte:head>
	<title>Sign in</title>
</svelte:head>

<div class="flex min-h-dvh flex-col bg-stone-950 text-stone-100 antialiased">
	<header class="px-5 pt-[max(env(safe-area-inset-top),1rem)] pb-4">
		<p class="mb-1.5 text-xs font-medium tracking-wider text-stone-500">Resend PWA</p>
		<h1 class="text-4xl font-bold tracking-tight text-white">Sign in</h1>
	</header>

	<form class="flex flex-col gap-4 px-5 pt-4" onsubmit={login.submit}>
		<label class="flex flex-col gap-2">
			<span class="text-xs font-semibold tracking-[0.2em] text-stone-500 uppercase">
				Access token
			</span>
			<div class="relative">
				<input
					type={login.visible ? 'text' : 'password'}
					bind:value={() => login.token, login.setToken}
					aria-invalid={login.error ? true : undefined}
					aria-describedby={login.error ? 'token-error' : undefined}
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
					onclick={login.toggleVisible}
					aria-label={login.visible ? 'Hide token' : 'Show token'}
					aria-pressed={login.visible}
					class="absolute inset-y-0 right-1.5 my-auto flex size-11 items-center justify-center rounded-full text-stone-400"
				>
					{#key login.visible}
						<span
							class="absolute"
							in:fade={{ duration: login.duration }}
							out:fade={{ duration: login.duration }}
						>
							{#if login.visible}
								<EyeSlashIcon size={20} weight="bold" />
							{:else}
								<EyeIcon size={20} weight="bold" />
							{/if}
						</span>
					{/key}
				</button>
			</div>
		</label>

		{#if login.error}
			<p
				id="token-error"
				role="alert"
				class="text-sm font-medium text-red-400"
				transition:slide={{ duration: login.duration }}
			>
				{login.error}
			</p>
		{/if}

		<p class="text-sm text-stone-500">
			The <code class="font-mono text-stone-400">ACCESS_TOKEN</code> from your server's
			<code class="font-mono text-stone-400">.env</code>. It's stored only on this device.
		</p>

		<button
			type="submit"
			disabled={!login.canSubmit}
			class="mt-2 h-14 rounded-full border border-amber-900 bg-amber-950 text-base font-semibold text-amber-400 transition-opacity duration-150 disabled:opacity-40 motion-reduce:transition-none"
		>
			{login.checking ? 'Checking…' : 'Sign in'}
		</button>
	</form>
</div>
