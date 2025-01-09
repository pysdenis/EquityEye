<!-- <script lang="ts">
	// import { adminStore } from '$lib/stores/userStore';
	// import type Admin from "$lib/types/Admin";
	// import { onMount } from "svelte";
	// import { fetchAdminData } from "$lib/api/fetchFromDatabase";
	// import Icon from "$lib/components/Icon.svelte";
	// import edit from "$lib/assets/icons/edit.svg?raw";
	// import deleteIcon from "$lib/assets/icons/delete.svg?raw";
	// import check from "$lib/assets/icons/check.svg?raw";
	// import cross from "$lib/assets/icons/cross.svg?raw";
	// import Modal from "$lib/components/Modal.svelte";
	// import { deleteAdminData } from "$lib/api/deleteFromDatabase";
	// import Logger from '$lib/components/Logger.svelte';

	// let showLogger = false;
	// let loggerMsg: string | unknown;
	// let admins: Admin[] = [];
	// let showModal = false;
	// let logType: "error" | "success" | undefined;
	// let selectedAdmin: Admin | null = null;

	// onMount(async () => {
	// 	const response = await fetchAdminData();
	// 	admins = response as Admin[];
	// });

	// function OpenDelete(admin: Admin) {
	// 	selectedAdmin = admin;
	// 	showModal = true;
	// }

	// async function confirmDelete() {
	// 	if (selectedAdmin && selectedAdmin.id) {
	// 		try {
	// 			await deleteAdminData(selectedAdmin.id);
	// 			admins = admins.filter((admin) => admin.id !== selectedAdmin?.id);
	// 			loggerMsg = "Admin byl úspěšně smazán";
	// 			logType = "success";
	// 			showLogger = true;
	// 		} catch (error) {
	// 			loggerMsg = "Něco se pokazilo, zkuste to prosím znovu";
	// 			logType = "error";
	// 			showLogger = true;
	// 		}
	// 	}
	// 	showModal = false;
	// }

	// function closeModal() {
	// 	showModal = false;
	// 	selectedAdmin = null;
	// }
</script> -->

<!-- {#if $adminStore}
	<p class="absolute max-md:hidden right-2 bottom-1">Přihlášen jako {$adminStore.loginName} | {$adminStore.email}</p>

	<div class="flex items-center py-8">
		<h1 class="font-light text-center p-0 my-0 text-4xl">Přehled administrátorů</h1>
	</div>

	<div class="w-full flex-col flex gap-1 pb-4 overflow-y-auto px-3">
		<div class="grid grid-cols-2 md:grid-cols-3 uppercase p-3 text-3xs md:text-2xs pb-3 border-b-2">
			<span>Login</span>
			<span class="hidden md:inline-block">Email</span>
			<span class="text-end">Smazat</span>
		</div>
		{#each admins as admin}
			<div class="grid grid-cols-2 md:grid-cols-3 p-3">
				<span>{admin.loginName}</span>
				<span class="hidden md:inline-block">{admin.email}</span>
				<span class="flex items-center gap-4 justify-end">
					<button on:click={() => OpenDelete(admin)}>
						<Icon icon={deleteIcon} class="w-5 h-5 text-text hover:!text-red-900 duration-300 transition-all" />
					</button>
				</span>
			</div>
		{/each}
	</div>
	{#if showModal}
		<Modal message="Opravdu chcete smazat tohodle admina a pro znovu vytvoření se bude muset znovu zaregistrovat." on:confirm={confirmDelete} on:close={closeModal} />
	{/if}
	{#if showLogger}
		<Logger message={loggerMsg} type={logType} on:close={() => showLogger = false} />
	{/if}

{/if} -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { userStore } from '../../lib/stores/userStore';

	let userData: any = null;

	onMount(async () => {
	  const token = localStorage.getItem('token');
	  const response = await fetch('/api/dashboard', {
		headers: {
					'Authorization': `Bearer ${token}`,
				},
	  });
	  if (response.ok) {
		userData = await response.json();
	  } else {
		console.error('Failed to fetch user data');
	  }

	  console.log(userData);
	});

	//


  </script>

  <main>
	<h1>Dashboard</h1>
	{#if userData}
	  <section>
		<h2>Welcome, {userData.username}</h2>
		<p>Email: {userData.email}</p>
		<h3>Portfolio</h3>
		<!-- {#if userData.portfolioId.assets && userData.portfolioId.assets.length === 0}
		  <p>No assets in portfolio</p>
		{:else}
		  <p>Assets in portfolio:</p>
		{/if}
		<ul>
		  {#each userData.portfolioId.assets as asset}
			<li>
			  {asset.symbol}: {asset.quantity} units @ ${asset.currentValue}
			</li>
		  {/each}
		</ul> -->
	  </section>
	{:else}
	  <p>Loading...</p>
	{/if}

  </main>
