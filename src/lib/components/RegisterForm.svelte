<script lang="ts">
	import { writable } from 'svelte/store';
	import logo from '$lib/assets/images/logo.png';
	import Logger from './Logger.svelte';
	import Icon from './Icon.svelte';
	import opened from '$lib/assets/icons/opened.svg?raw';
	import closed from '$lib/assets/icons/closed.svg?raw';
	import StaticPicture from './picture/StaticPicture.svelte';

	let username = '';
	let email = '';
	let password = '';
	let confirmPassword = '';

	let showLogger = false;
	let loggerMsg = writable('');

	let passwordMatch = true;
	let showPassword = false;
	let passwordLowercase = true;
	let passwordUppercase = true;
	let passwordNumber = true;
	let emailValid = true;

	function closeLogger() {
		showLogger = false;
	}

	const handleSubmit = async () => {
		if (password !== confirmPassword) {
			loggerMsg.set('Hesla se neshodují!');
			showLogger = true;
			return;
		}

		// přidat validace hesel
		if (!email.includes('@') || !email.includes('.') || email.length < 5) {
			showLogger = true;
			loggerMsg.set('Email není validní');
			return;
		}

		const response = await fetch('/auth/register', { // TODO do funkce
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ username, email, password })
		});
		const data = await response.json();
		if (data.token) {
				localStorage.setItem('token', data.token);
				localStorage.setItem('email', email);
				localStorage.setItem('id', data.id);
				window.location.assign('/');
		} else {
			loggerMsg.set(data.error || 'Došlo k chybě při registraci.');
			showLogger = true;
		}
	};
</script>

<main class="flex justify-center h-[100dvh] w-[100dvw] bg-gray-200 items-center">
	<div class="mb-12">
		<div class="flex justify-between w-full items-center">
			<h1 class="text-xl m-0 p-0 uppercase">Registrace</h1>
			<StaticPicture image={logo} height={48} width={48} alt="Logo THE CAP" imgClass="h-12" />
		</div>
		<form on:submit|preventDefault={handleSubmit} class="flex flex-col md:grid grid-cols-2 gap-4">
			<label class="flex flex-col">
				Email
				<input type="email" bind:value={email} class="p-2 md:w-[15rem]" />
			</label>
			<label class="flex flex-col">
				Uživatelské jméno
				<input type="text" bind:value={username} class="p-2 md:w-[15rem]" />
			</label>
			<label class="flex flex-col">
				Heslo
				<div class="relative">
					{#if showPassword}
						<input type="text" bind:value={password} class="p-2 md:w-[15rem]" />
					{:else}
						<input type="password" bind:value={password} class="p-2 md:w-[15rem]" />
					{/if}
				</div>
			</label>
			<label class="flex flex-col">
				Heslo znovu
				<div class="relative">
					{#if showPassword}
						<input type="text" bind:value={confirmPassword} class="p-2 md:w-[15rem]" />
					{:else}
						<input type="password" bind:value={confirmPassword} class="p-2 md:w-[15rem]" />
					{/if}
					<button type="button" class="absolute top-1/2 right-2 transform -translate-y-1/2" on:click={() => showPassword = !showPassword}>
						{#if showPassword}
							<Icon icon={opened} class="w-4 h-4 bg-white" />
						{:else}
							<Icon icon={closed} class="w-4 h-4 bg-white" />
						{/if}
					</button>
				</div>
			</label>
			<button type="submit" class="p-2 bg-black col-span-2 text-white text-xs hover:scale-105 transition-all duration-300">Registrovat se</button>
		</form>
		{#if !passwordMatch}
			<p class="text-red-500 mb-4">Hesla se neshodují</p>
		{/if}
		{#if !passwordLowercase}
			<p class="text-red-500 mb-4">Heslo musí obsahovat malé písmeno</p>
		{/if}
		{#if !passwordUppercase}
			<p class="text-red-500 mb-4">Heslo musí obsahovat velké písmeno</p>
		{/if}
		{#if !passwordNumber}
			<p class="text-red-500 mb-4">Heslo musí obsahovat číslo</p>
		{/if}
		{#if !emailValid}
			<p class="text-red-500 mb-4">Email není validní</p>
		{/if}
	</div>
	{#if showLogger}
		<Logger message={loggerMsg} type="error" {closeLogger}  />
	{/if}
</main>
