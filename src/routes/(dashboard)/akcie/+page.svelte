<script lang="ts">
	import stocksData from '$lib/stocksTickers/tickers.json';
	import mglass from "$lib/assets/icons/mglass.svg?raw";
	import Icon from '../../../lib/components/Icon.svelte';
	import { onMount } from 'svelte';

	let query = '';
	let results: string | any[] = [];

	const searchStocks = () => {
		if (query.length < 1) {
			results = [];
			return;
		}

		results = stocksData.filter((stock) =>
			stock.ticker.toLowerCase().includes(query.toLowerCase())
		);
	};

	const selectStock = (ticker: string) => {
		query = ticker;
		results = [];
	};

	//tuto cast pak nahradit
	const stockList = [
		{ ticker: 'AAPL', name: 'Apple Inc.' },
		{ ticker: 'GOOGL', name: 'Alphabet Inc.' },
		{ ticker: 'TSLA', name: 'Tesla Inc.' },
		{ ticker: 'MSFT', name: 'Microsoft Corp.' },
		{ ticker: 'AMZN', name: 'Amazon.com Inc.' }
	];

	let stocks: any[] = [];

	const fetchStockData = async () => {
		const res = await fetch('/api/multiStocks'); // Volání API
		const data = await res.json();
		stocks = data;
	};

	onMount(() => {
		fetchStockData();
	});



</script>

<form class="flex-1 flex">
	<input
		type="text"
		bind:value={query}
		placeholder="Hledat akcii..."
		on:input={searchStocks}
		class="flex-1 rounded-l-lg border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
	/>
	<button
		on:click={searchStocks}
		class="rounded-r-lg bg-blue-600 px-4 py-2 font-medium text-white shadow duration-300 transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
	>
		<Icon icon={mglass} class="w-5 h-5 text-white" />
	</button>
</form>

{#if results.length > 0}
	<ul class="mt-2 flex flex-col gap-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
		{#each results as { ticker, name }}
			<li>
				<button on:click={() => selectStock(ticker)} class="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg">
					<span class="font-semibold">{ticker}</span> - <span class="text-gray-600">{name}</span>
				</button>
			</li>
		{/each}
	</ul>
{/if}

<h1>Seznam akcií</h1>
<table class="border-collapse w-full">
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
