<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { userStore } from '../../lib/stores/userStore';
	import Loading from '../../lib/components/Loading.svelte';

	let userData: User = null;

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


  </script>

  <main>
	<h1>Dashboard</h1>
	{#if userData}
	  <section>
		<h2>Welcome, {userData.username}</h2>
		<p>Email: {userData.email}</p>
		<h3>Portfolio</h3>
		{#if userData.portfolioId.assets || userData.portfolioId.assets.length === 0}
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
		</ul>
	  </section>
	{:else}
		<Loading />
	{/if}

  </main>
