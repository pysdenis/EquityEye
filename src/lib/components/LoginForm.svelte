<script lang="ts">
	import { writable } from 'svelte/store';
	import logo from '$lib/assets/images/logo.png';
	import Logger from './Logger.svelte';
	import Icon from './Icon.svelte';
	import opened from '$lib/assets/icons/opened.svg?raw';
	import closed from '$lib/assets/icons/closed.svg?raw';
	import StaticPicture from './picture/StaticPicture.svelte';
	import { onMount } from 'svelte';

	let email = '';
	let loginPassword = '';
	let showPassword = false;
	let showLogger = false;
	let loggerMsg = writable('');
	let wrongCredentials = false;

	onMount(() => {
		const token = localStorage.getItem('token');
		if (token) {
			window.location.assign('/');
		}
	});

	const handleSubmit = async () => {
		try {
			const response = await fetch('/auth/login', { // TODO do funkce
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password: loginPassword })
			});
			if (response.ok) {
				const data = await response.json();
				// setUser(data.token, data.user);
				localStorage.setItem('token', data.token);
				localStorage.setItem('email', email);
				localStorage.setItem('id', data.id);
				window.location.assign('/');
			} else {
				throw new Error('No token in response');
			}
		} catch (error) {
			loggerMsg.set('Špatné přihlašovací údaje');
			showLogger = true;
		}
	};
</script>

<main class="flex h-[100dvh] w-[100dvw] items-center justify-center bg-gray-200">
	<div class="mb-12">
		<div class="flex w-full items-center justify-between">
			<h1 class="m-0 p-0 text-xl uppercase">Přihlášení</h1>
			<StaticPicture image={logo} height={48} width={48} alt="Logo THE CAP" imgClass="h-12" />
		</div>
		<form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-4">
			<label class="flex flex-col">
				Email
				<input type="email" bind:value={email} class="p-2 md:w-[15rem]" />
			</label>
			<label class="flex flex-col">
				Heslo
				<div class="relative">
					{#if showPassword}
						<input type="text" bind:value={loginPassword} class="p-2 md:w-[15rem]" />
					{:else}
						<input type="password" bind:value={loginPassword} class="p-2 md:w-[15rem]" />
					{/if}
					<button
						type="button"
						class="absolute right-2 top-1/2 -translate-y-1/2 transform"
						on:click={() => (showPassword = !showPassword)}
					>
						{#if showPassword}
							<Icon icon={opened} class="h-4 w-4 bg-white" />
						{:else}
							<Icon icon={closed} class="h-4 w-4 bg-white" />
						{/if}
					</button>
				</div>
			</label>
			<button
				type="submit"
				class="bg-black p-2 text-xs text-white transition-all duration-300 hover:scale-105"
				>Přihlásit se</button
			>
		</form>
		{#if wrongCredentials}
			<p class="mt-4 text-center text-3xs text-red-500">Špatné přihlašovací údaje</p>
		{/if}
	</div>
	{#if showLogger}
		<Logger message={loggerMsg} on:close={() => (showLogger = false)} />
	{/if}
</main>
