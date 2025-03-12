<script lang="ts">
	import { onMount } from 'svelte';
	import { writable, type Writable } from 'svelte/store';
	import type { PortfolioData, Stock } from '../types/portfolioTypes'; // TODO types

    // export interface Stock {
    // }

    // export interface PortfolioData {
    // }


	let userId: string = localStorage.getItem('id') ?? '';
	let portfolio: Writable<PortfolioData | null> = writable(null);
	let loading: Writable<boolean> = writable(true);
	let error: Writable<string | null> = writable(null);

	async function fetchPortfolio() {
		try {
			const response = await fetch(`/api/portfolio/get/?userId=${userId}`);
			const data: PortfolioData = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Chyba při načítání portfolia');
			}

			portfolio.set(data);
		} catch (err) {
			error.set((err as Error).message);
		} finally {
			loading.set(false);
		}
	}

	onMount(fetchPortfolio);
</script>

{#if $loading}
	<p>Načítám portfolio...</p>
{:else if $error}
	<p class="text-red-500">Chyba: {$error}</p>
{:else if !$portfolio || $portfolio.stocks.length === 0}
	<p>Portfolio je prázdné.</p>
{:else}
	<table class="w-full border-collapse border border-gray-300 mt-4">
		<thead>
			<tr class="bg-gray-100">
				<th class="border p-2">Ticker</th>
				<th class="border p-2">Počet</th>
				<th class="border p-2">Investovaná částka</th>
				<th class="border p-2">Reálná hodnota</th>
			</tr>
		</thead>
		<tbody>
			{#each $portfolio.stocks as stock}
				<tr class="text-center">
					<td class="border p-2">{stock.ticker}</td>
					<td class="border p-2">{stock.amount}</td>
					<td class="border p-2">${(stock.amount * stock.priceAtTime).toFixed(2)}</td>
					<td class="border p-2">${(stock.amount * stock.currentPrice).toFixed(2)}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<div class="mt-4">
		<p><strong>Celkově investováno:</strong> ${$portfolio.totalInvested.toFixed(2)} USD</p>
		<p><strong>Současná hodnota:</strong> ${$portfolio.totalValue.toFixed(2)} USD</p>
	</div>
{/if}
