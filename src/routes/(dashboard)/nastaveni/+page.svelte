<script lang="ts">
	import { onMount } from 'svelte';
	import { refreshUnreadCount } from '../../../lib/scripts/notifications';

	let newUsername = '';
	let oldPassword = '';
	let newPassword = '';
	let message = '';
	let error = '';

	let notifications: any[] = [];
	let notifError = '';

	async function updateUser() {
		error = '';
		message = '';

		const response = await fetch('/api/update-user', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				userId: localStorage.getItem('id'),
				newUsername,
				oldPassword,
				newPassword
			})
		});

		const result = await response.json();
		if (response.ok) {
			message = result.message;
		} else {
			error = result.error;
		}
	}

	$: buttonText =
		newUsername.length > 0 && newPassword.length > 0
			? 'Změnit uživatelské jméno i heslo'
			: newUsername.length > 0
				? 'Změnit uživatelské jméno'
				: newPassword.length > 0
					? 'Změna hesla'
					: 'Uložit';

	onMount(async () => {
		try {
			const res = await fetch('/api/notifications?userId=' + localStorage.getItem('id'));
			if (!res.ok) throw new Error('Nepodařilo se načíst oznámení');
			notifications = await res.json();
		} catch (err) {
			notifError = (err as Error).message;
		}
	});

	async function markAsSeen(id: string) {
		await fetch('/api/notifications?userId=' + localStorage.getItem('id'), {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ notificationId: id })
		});

		notifications = notifications.map((n) => (n._id === id ? { ...n, seen: true } : n));
		refreshUnreadCount();
	}
</script>

<div class="container">
	<h1 class="mb-6 text-3xl font-bold">Nastavení</h1>

	{#if message}
		<p class="mb-3 rounded-md bg-green-100 p-2 text-green-600">{message}</p>
	{/if}
	{#if error}
		<p class="mb-3 rounded-md bg-red-100 p-2 text-red-600">{error}</p>
	{/if}

	<form on:submit|preventDefault={updateUser} class="flex flex-col gap-4 lg:grid lg:grid-cols-2">
		<div>
			<label class="flex flex-col">
				Nové uživatelské jméno
				<input type="email" bind:value={newUsername} class="p-2" />
			</label>
		</div>
		<div class="space-y-4">
			<div>
				<label class="flex flex-col">
					Heslo
					<input type="password" bind:value={oldPassword} class="p-2" required />
				</label>
			</div>
			<div>
				<label class="flex flex-col">
					Nové heslo
					<input type="password" bind:value={newPassword} class="p-2" />
				</label>
			</div>
		</div>
		<button
			type="submit"
			class="col-span-2 bg-black p-2 text-xs text-white transition-all duration-300 hover:scale-105"
			>{buttonText}</button
		>
	</form>

	<hr class="my-8" />
	<h2 class="mb-4 text-2xl font-semibold">Oznámení</h2>
	{#if notifError}
		<p class="text-red-500 text-sm">{notifError}</p>
	{:else if notifications.length === 0}
		<p class="text-gray-500 text-sm">Žádná oznámení k zobrazení.</p>
	{:else}
		<div class="space-y-2">
			{#each notifications as notif}
				<div
					class="flex items-start gap-3 rounded-md border p-3 shadow-sm transition hover:bg-gray-50 {notif.seen
						? 'border-gray-200'
						: 'border-blue-400'}"
				>
					<div class="flex-1">
						<p class="text-sm text-gray-800">{notif.message}</p>
						<p class="text-xs text-gray-400">{new Date(notif.createdAt).toLocaleString()}</p>
					</div>
					{#if !notif.seen}
						<span class="rounded-full bg-blue-500 px-2 py-1 text-xs font-medium text-white">Nové</span>
						<button
							type="button"
							class="text-xs text-blue-500 underline hover:text-blue-700"
							on:click={() => markAsSeen(notif._id)}
						>
							Označit jako přečtené
						</button>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
