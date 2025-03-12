<script lang="ts">
	import stocksData from '$lib/stocksTickers/tickers.json';
	import mglass from '$lib/assets/icons/mglass.svg?raw';
	import Icon from '../../../lib/components/Icon.svelte';
	import { onMount } from 'svelte';

	let query = '';
	let results: string | any[] = [];
	let selectedStock: any = null;
	let amount = 1; // Pole pro množství akcií
	let stocks: any[] = [];
	let buyDate = new Date().toISOString().split('T')[0];

	// Hledání akcií podle jména nebo tickeru
	const searchStocks = () => {
		if (query.length < 1) {
			results = [];
			return;
		}

		results = stocksData.filter(
			(stock) =>
				stock.name.toLowerCase().includes(query.toLowerCase()) ||
				stock.ticker.toLowerCase().includes(query.toLowerCase())
		);
	};

	// Výběr akcie
	const selectStock = (ticker: string) => {
		query = ticker;
		results = [];
		selectedStock = stocksData.find((stock) => stock.ticker === ticker);
	};

	// Načtení dat o akciích
	const fetchStockData = async () => {
		const res = await fetch('/api/multiStocks'); // Volání API
		const data = await res.json();
		stocks = data;
	};

	// Odeslání požadavku na backend pro přidání akcie do portfolia
	const buyStock = async () => {
		if (!selectedStock || amount < 1) return;

		const res = await fetch('/api/portfolio/add', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				ticker: selectedStock.ticker,
				amount,
				userId: localStorage.getItem('id'),
				buyDate,
			}),
		});

		const data = await res.json();
		if (data.message) {
			alert(data.message); // Můžeš upravit na vlastní notifikaci
		} else {
			alert(data.error);
		}
	};

	onMount(() => {
		fetchStockData();
	});
</script>

<form class="flex flex-1">
	<input
		type="text"
		bind:value={query}
		placeholder="Hledat akcii..."
		on:input={searchStocks}
		class="flex-1 rounded-l-lg border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
	/>
	<button
		on:click={searchStocks}
		class="rounded-r-lg bg-blue-600 px-4 py-2 font-medium text-white shadow transition-all duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
	>
		<Icon icon={mglass} class="h-5 w-5 text-white" />
	</button>
</form>

{#if results.length > 0}
	<ul class="mt-2 flex flex-col gap-2 rounded-lg border border-gray-300 bg-white p-4 shadow-lg">
		{#each results as { ticker, name }}
			<li>
				<button
					on:click={() => selectStock(ticker)}
					class="w-full rounded-lg px-4 py-2 text-left hover:bg-gray-100"
				>
					<span class="font-semibold">{ticker}</span> - <span class="text-gray-600">{name}</span>
				</button>
			</li>
		{/each}
	</ul>
{/if}

{#if selectedStock}
	<div class="mt-4">
		<h3 class="text-xl">Zakoupit akcii: {selectedStock.name} ({selectedStock.ticker})</h3>
		<p class="text-gray-600">Aktuální cena: {selectedStock.price}</p>
		<input
			type="number"
			bind:value={amount}
			min="1"
			class="mt-2 rounded border p-2"
			placeholder="Počet akcií"
		/>
		<input
			type="date"
			bind:value={buyDate}
			class="mt-2 rounded border p-2"
			max={new Date().toISOString().split('T')[0]}
			min={new Date(new Date().setFullYear(new Date().getFullYear() - 2)).toISOString().split('T')[0]}
		/>
		<button
			on:click={buyStock}
			class="mt-4 bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600"
		>
			Zakoupit akcii
		</button>
	</div>
{/if}

<h1>Seznam akcií</h1>
<table class="w-full border-collapse">
	<thead>
		<tr>
			<th class="border p-2">Ticker</th>
			<th class="border p-2">Název</th>
			<th class="border p-2">Cena</th>
		</tr>
	</thead>
	<tbody>
		{#each stocks as { ticker, name, price }}
			<tr>
				<td class="border p-2">{ticker}</td>
				<td class="border p-2">{name}</td>
				<td class="border p-2">{price}</td>
			</tr>
		{/each}
	</tbody>
</table>
