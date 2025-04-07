<script lang="ts">
	import { DateTime } from 'luxon';
	import LineChart from '../../../lib/components/LineChart.svelte';
	import { popularTickets } from '../../../lib/consts/popularTickets';
	import Logger from '../../../lib/components/Logger.svelte';
	import { writable } from 'svelte/store';
	import { refreshUnreadCount } from '../../../lib/scripts/notifications';

	let query = '';
	let results: any[] = [];
	let input = '';
	let selectedStock: any = null; // Uchovává vybranou akcii i s detaily
	let amount = 0.01; // Množství nakupovaných akcií
	let buyDate = new Date().toISOString().slice(0, 10);
	let historicalPrice = 0; // Cena akcie k danému datu
	let message = writable('');
	let type: 'error' | 'success' = 'error';
	let showLogger = false;

	function handleAddStock(stock: string | undefined) {
		if (!stock) return;
		selectedStock = { ticker: stock };
		loadStockInfo(stock);
		loadHistoricalPrice(stock, buyDate);
	}

	// Odeslání nákupu na backend
	async function buyStock() {
		if (amount <= 0) {
			showLogger = true;
			message.set('Množství akcií musí být větší než 0');
			type = 'error';
			return;
		}
		const selectedDate = new Date(buyDate);
		const day = selectedDate.getDay();
		if (day === 0 || day === 6) {
			// 0 = Sunday, 6 = Saturday
			showLogger = true;
			message.set('Vybrané datum je víkend. Vyberte prosím pracovní den.');
			type = 'error';
			return;
		}
		const res = await fetch('/api/portfolio/add', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				ticker: selectedStock.ticker,
				amount,
				userId: localStorage.getItem('id'),
				buyDate
			})
		});

		refreshUnreadCount();

		if (res.ok) {
			showLogger = true;
			selectedStock = null;
			message.set('Akcii byla úspěšně přidána do portfolia');
			type = 'success';
		} else {
			showLogger = true;
			message.set('Něco se pokazilo, zkuste to prosím znovu');
			type = 'error';
		}
	}

	// Vyhledávání tickerů podle zadaného textu
	async function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		query = target.value.trim();

		if (!query) {
			results = [];
			return;
		}

		// Voláme vlastní endpoint, který proxy-fikuje Polygon (nebo jinou službu)
		const res = await fetch(`/api/ticketSearch?query=${encodeURIComponent(query)}`);
		if (res.ok) {
			results = await res.json();
		} else {
			results = [];
		}
	}

	// Při kliknutí na některý ticker z výsledků ho vybereme a načteme další info
	function selectTicker(item: any) {
		selectedStock = {
			ticker: item.ticker,
			name: item.name
		};
		results = [];
		input = '';

		// Po výběru načteme detailní info o firmě
		loadStockInfo(selectedStock.ticker);
		// A také zjistíme cenu k aktuálnímu buyDate
		loadHistoricalPrice(selectedStock.ticker, buyDate);
	}

	// Načtení detailních informací o firmě (market cap, list_date apod.)
	async function loadStockInfo(ticker: string) {
		try {
			const res = await fetch(`/api/tickerInfo?tickerSymbol=${ticker}`);
			if (res.ok) {
				const info = await res.json();
				selectedStock = { ...selectedStock, ...info };
			}
		} catch (error) {
			console.error('Chyba při načítání detailů firmy:', error);
		}
	}

	let priceNow = 0;

	// Načtení historické ceny k danému datu (vyžaduje vlastní backend endpoint)
	async function loadHistoricalPrice(ticker: string, date: string) {
		try {
			const url = new URL(`/api/stocks`, window.location.origin);
			url.searchParams.set(`ticker`, ticker.toUpperCase());

			const res = await fetch(url.toString());

			window.scrollTo(0, 0);

			if (res.ok) {
				const data = await res.json();
				priceNow = data.results[0].c;
			} else {
				historicalPrice = 0;
			}
		} catch (error) {
			console.error('Chyba při načítání ceny:', error);
		}
		try {
			const url = new URL(`/api/stockNameDate`, window.location.origin);
			url.searchParams.set(`tickerSymbol`, ticker.toUpperCase());
			url.searchParams.set(`multiplier`, (5).toString());
			url.searchParams.set(`timespan`, 'hour');
			url.searchParams.set(`from`, date);

			const res = await fetch(url.toString());

			window.scrollTo(0, 0);

			if (res.ok) {
				const data = await res.json();
				historicalPrice = data[0].y;
			} else {
				historicalPrice = 0;
			}
		} catch (error) {
			console.error('Chyba při načítání historické ceny:', error);
			historicalPrice = 0;
		}
	}

	function closeLogger() {
		showLogger = false;
	}

	// Reagujeme na změnu buyDate (nebo selectedStock) a znovu načteme historickou cenu
	$: if (selectedStock?.ticker && buyDate) {
		loadHistoricalPrice(selectedStock.ticker, buyDate);
	}
</script>

{#if showLogger}
	<Logger {message} {type} {closeLogger} />
{/if}

<!-- Vyhledávací pole -->
<div class="relative flex flex-col gap-2">
	<input
		type="text"
		placeholder="Hledat akcii..."
		bind:value={input}
		on:input={handleInput}
		class="rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
	/>

	<!-- Výpis výsledků hledání -->
	{#if results.length > 0}
		<ul
			class="absolute top-14 z-10 flex w-full flex-col gap-2 rounded-lg border border-gray-300 bg-white p-2 shadow-lg"
		>
			{#each results as item}
				<li>
					<button
						type="button"
						class="w-full rounded-lg px-4 py-2 text-left transition-all duration-300 hover:bg-gray-100"
						on:click={() => selectTicker(item)}
					>
						<span class="text-gray-600">{item.name ?? 'Unknown Name'}</span>
						<span class="font-semibold">({item.ticker})</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<!-- Pokud máme vybranou akcii, zobrazíme blok pro nákup + detaily o firmě -->
{#if selectedStock}
	<div class="mt-4 rounded bg-white p-4 shadow-md">
		<LineChart stockTicker={selectedStock.ticker} defaultStyle {handleAddStock} />
		<!-- Formulář pro zadání množství a data nákupu -->
		<p class="mt-2 text-xs text-gray-500">
			{selectedStock.description}
		</p>
		<div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
			<div>
				<label for="amount" class="block text-sm font-medium text-gray-700">Počet akcií</label>
				<input
					id="amount"
					type="number"
					min="0.001"
					step="0.001"
					bind:value={amount}
					class="mt-1 w-32 rounded border p-2"
				/>
			</div>
			<div>
				<label for="buyDate" class="block text-sm font-medium text-gray-700">Datum nákupu</label>
				<input
					id="buyDate"
					type="date"
					bind:value={buyDate}
					max={new Date().toISOString().slice(0, 10)}
					min={new Date(new Date().setFullYear(new Date().getFullYear() - 10))
						.toISOString()
						.slice(0, 10)}
					class="mt-1 rounded border p-2"
					on:change={(event: Event) => {
						const buyDate = (event.target as HTMLInputElement).value;
						if (buyDate) {
							const selectedDate = new Date(buyDate);
							const day = selectedDate.getDay();
							if (day === 0 || day === 6) {
								// 0 = Sunday, 6 = Saturday
								showLogger = true;
								message.set('Vybrané datum je víkend. Vyberte prosím pracovní den.');
								type = 'error';
								return;
							}
						}
					}}
				/>
			</div>
		</div>

		<!-- Zobrazení historické ceny a celkové částky -->
		<div class="mt-4 text-sm text-gray-700">
			<p>
				<strong>Cena teď:</strong>
				{priceNow ? `${priceNow} USD` : 'Burza je zavřená'}
			</p>
			<p>
				<strong>Cena k danému datu:</strong>
				{historicalPrice > 0 ? `${historicalPrice} USD` : 'Burza je zavřená'}
			</p>
			<p>
				<strong>Celková cena:</strong>
				{historicalPrice > 0 ? (historicalPrice * amount).toFixed(2) + ' USD' : 'Burza je zavřená'}
			</p>
		</div>

		<!-- Tlačítko pro nákup -->
		<button
			on:click={buyStock}
			class="mt-4 {historicalPrice <= 0
				? 'bg-green-900/10'
				: ''} rounded bg-green-500 px-4 py-2 font-semibold text-white shadow transition-all duration-300 hover:bg-green-600"
			disabled={historicalPrice <= 0}
		>
			Přidat akcii do portfolia
		</button>
		<button
			on:click={() => (selectedStock = null)}
			class="mt-4 rounded bg-transparent px-4 py-2 transition-all"
		>
			Zrušit
		</button>
	</div>
{/if}

<!-- Populární akcie (grafy) -->
<h1 class="mt-8 text-xl font-semibold">Populární akcie 🔥</h1>
<div class="mt-4 flex flex-col gap-4">
	{#each popularTickets as stock}
		<LineChart stockTicker={stock} defaultStyle={false} {handleAddStock} />
	{/each}
</div>
