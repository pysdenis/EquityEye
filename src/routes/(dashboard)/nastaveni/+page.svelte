<script>
	let newUsername = '';
	let oldPassword = '';
	let newPassword = '';
	let message = '';
	let error = '';

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

	$: buttonText = newUsername.length > 0 && newPassword.length > 0 ? 'Změnit uživatelské jméno i heslo' : (newUsername.length > 0 ? 'Změnit uživatelské jméno' : (newPassword.length > 0 ? 'Změna hesla' : 'Uložit'));
</script>

<div class="container">
	<h1 class="mb-6 text-3xl font-bold">Nastavení</h1>

	{#if message}
		<p class="mb-3 rounded-md bg-green-100 p-2 text-green-600">{message}</p>
	{/if}
	{#if error}
		<p class="mb-3 rounded-md bg-red-100 p-2 text-red-600">{error}</p>
	{/if}

	<form on:submit|preventDefault={updateUser} class="lg:grid flex flex-col lg:grid-cols-2 gap-4">
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
		<button type="submit" class="p-2 bg-black col-span-2 text-white text-xs hover:scale-105 transition-all duration-300">{buttonText}</button>
	</form>
</div>
