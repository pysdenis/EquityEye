<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, Tooltip, type ChartData, type ChartOptions } from 'chart.js';
	import 'chartjs-adapter-luxon';
	import 'chart.js/auto';

	// Datový typ pro jednu položku v portfoliu
	interface PortfolioStock {
		ticker: string;
		amount: number; // kladné/záporné/desetinné (např. 1.5 akcie)
		priceAtTime: number; // nákupní cena
		dateAdded: string; // ISO string (např. "2025-03-10T20:20:01.894Z")
	}

	// Datový typ pro celé portfolio
	interface Portfolio {
		stocks: PortfolioStock[];
	}

	/**
	 * Sloučí více nákupů stejného tickeru do jedné pozice (vážená průměrná cena).
	 */
	function unifyPositions(stocks: PortfolioStock[]): PortfolioStock[] {
		const map = new Map<
			string,
			{ ticker: string; totalAmount: number; totalCost: number; earliestDate: string }
		>();

		for (const s of stocks) {
			let bucket = map.get(s.ticker);
			if (!bucket) {
				bucket = {
					ticker: s.ticker,
					totalAmount: 0,
					totalCost: 0,
					earliestDate: s.dateAdded
				};
				map.set(s.ticker, bucket);
			}
			bucket.totalAmount += s.amount;
			bucket.totalCost += s.priceAtTime * s.amount;
			if (new Date(s.dateAdded).getTime() < new Date(bucket.earliestDate).getTime()) {
				bucket.earliestDate = s.dateAdded;
			}
		}

		const unified: PortfolioStock[] = [];
		for (const item of map.values()) {
			if (item.totalAmount === 0) continue;
			const averagePrice = item.totalCost / item.totalAmount;

			unified.push({
				ticker: item.ticker,
				amount: item.totalAmount,
				priceAtTime: averagePrice,
				dateAdded: item.earliestDate
			});
		}
		return unified;
	}

	let portfolio: Portfolio | null = null;
	let totalInvested = 0; // Součet (priceAtTime * amount)
	let currentPortfolioValue = 0; // Aktuální hodnota portfolia
	let difference = 0; // Rozdíl (aktuální hodnota - investováno)

	// Seznam sloučených pozic pro tabulku (jedna řádka na každý ticker)
	let aggregatedPositions: PortfolioStock[] = [];

	// Ukládání aktuálních cen (např. { 'TSLA': 123.45 })
	let currentPrices: Record<string, number> = {};

	// Prodej: zadávání kusů a částky pro každou řádku
	let sellQty: number[] = [];
	let sellAmount: number[] = [];

	// Časová řada: pro Chart.js (2 datové řady: hodnota, investováno)
	let portfolioData: ChartData<'line', number[], string> = {
		labels: [],
		datasets: [
			{
				label: 'Hodnota portfolia',
				data: [],
				borderColor: 'rgb(30, 41, 59)',
				backgroundColor: 'rgba(30, 41, 123, 0.5)',
				tension: 0.3,
				fill: true,
				pointRadius: 0
			},
			{
				label: 'Investováno',
				data: [],
				borderColor: 'rgba(200, 0, 0, 0.8)',
				backgroundColor: 'rgba(200, 0, 0, 0.1)',
				tension: 0.1,
				fill: false,
				pointRadius: 0
			}
		]
	};

	let chartOptions: ChartOptions<'line'> = {
		responsive: true,
		maintainAspectRatio: false,
		interaction: {
			intersect: false
		},
		scales: {
			x: {
				type: 'time',
				time: {
					unit: 'day'
				},
				ticks: {
					color: 'black'
				}
			},
			y: {
				ticks: {
					color: 'black'
				}
			}
		},
		plugins: {
			legend: {
				display: true
			}
		}
	};

	let canvasElem: HTMLCanvasElement;
	let chart: Chart | null = null;

	onMount(async () => {
		Chart.register(Tooltip);
		await loadPortfolio();

		chart = new Chart(canvasElem, {
			type: 'line',
			data: portfolioData,
			options: chartOptions
		});
	});

	// Cleanup grafu při odpojení komponenty
	$: () => {
		return () => {
			chart?.destroy();
			chart = null;
		};
	};

	// Kdykoli se portfolioData změní, aktualizujeme graf
	$: if (chart) {
		chart.data = portfolioData;
		chart.update();
	}

	// Načte portfolio uživatele
	async function loadPortfolio() {
		try {
			const url = new URL('/api/portfolio/get', window.location.origin);
			url.searchParams.set('userId', localStorage.getItem('id')!);
			const res = await fetch(url.toString());
			if (!res.ok) throw new Error('Chyba při načítání portfolia');
			portfolio = await res.json();

			if (portfolio && portfolio.stocks) {
				// 1) Spočítáme investovanou částku
				totalInvested = portfolio.stocks.reduce((sum, s) => {
					return sum + s.priceAtTime * s.amount;
				}, 0);

				// 2) Naplníme data do grafu (každý nákup zvlášť pro přesný výpočet v čase)
				const mergedData = await mergePortfolioData(portfolio.stocks);
				portfolioData.labels = mergedData.map((d) => d.x);
				portfolioData.datasets[0].data = mergedData.map((d) => d.value);
				portfolioData.datasets[1].data = mergedData.map((d) => d.cost);

				// Poslední hodnota => aktuální hodnota
				if (mergedData.length > 0) {
					currentPortfolioValue = mergedData[mergedData.length - 1].value;
				} else {
					currentPortfolioValue = 0;
				}
				difference = currentPortfolioValue - totalInvested;

				// 3) Sloučíme pozice pro tabulku (jeden řádek na ticker)
				aggregatedPositions = unifyPositions(portfolio.stocks);

				// 4) Načteme aktuální ceny pro KAŽDÝ ticker
				await loadCurrentPrices(aggregatedPositions);
			}
		} catch (err) {
			console.error(err);
		}
	}

	// Sloučíme historická data do dvou map:
	//  - timeValueMap: součet (aktuální cena × amount)
	//  - timeCostMap: součet (nákupní cena × amount)
	async function mergePortfolioData(stocks: PortfolioStock[]) {
		const timeValueMap = new Map<string, number>();
		const timeCostMap = new Map<string, number>();

		for (const stock of stocks) {
			const fromISO = new Date(stock.dateAdded).toISOString().split('T')[0];
			const url = new URL('/api/stockNameDate', window.location.origin);
			url.searchParams.set('tickerSymbol', stock.ticker);
			url.searchParams.set('multiplier', '1');
			url.searchParams.set('timespan', 'day');
			url.searchParams.set('from', fromISO);

			try {
				const res = await fetch(url.toString());
				if (!res.ok) {
					console.error(`Chyba fetchu pro ${stock.ticker}`);
					continue;
				}
				const history = await res.json(); // Array of { x: dateString, y: price }

				for (const point of history) {
					const ts = point.x;
					// Hodnota portfolia (aktuální cena × amount)
					const val = point.y * stock.amount;
					// Investovaná částka (nákupní cena × amount)
					const cost = stock.priceAtTime * stock.amount;

					timeValueMap.set(ts, (timeValueMap.get(ts) ?? 0) + val);
					timeCostMap.set(ts, (timeCostMap.get(ts) ?? 0) + cost);
				}
			} catch (error) {
				console.error('Chyba při zpracování', error);
			}
		}

		const merged: { x: string; value: number; cost: number }[] = [];
		const allTimestamps = new Set([...timeValueMap.keys(), ...timeCostMap.keys()]);

		for (const ts of allTimestamps) {
			merged.push({
				x: ts,
				value: timeValueMap.get(ts) ?? 0,
				cost: timeCostMap.get(ts) ?? 0
			});
		}

		merged.sort((a, b) => {
			return new Date(a.x).getTime() - new Date(b.x).getTime();
		});
		return merged;
	}

	// Načteme aktuální ceny pro dané tickery
	async function loadCurrentPrices(stocks: PortfolioStock[]) {
		const uniqueTickers = new Set(stocks.map((s) => s.ticker));

		for (const ticker of uniqueTickers) {
			// Upravte dle vašeho endpointu, aby vracel "results" s [ { c: ... } ]
			const url = new URL('/api/stocks', window.location.origin);
			url.searchParams.set('ticker', ticker);

			try {
				const res = await fetch(url.toString());
				if (!res.ok) {
					currentPrices[ticker] = 0;
					continue;
				}
				const data = await res.json();
				// Ověřte, zda data mají tvar: { results: [ { c: number } ] }
				if (data.results && data.results.length > 0) {
					currentPrices[ticker] = data.results[0].c;
				} else {
					currentPrices[ticker] = 0;
				}
			} catch (error) {
				currentPrices[ticker] = 0;
			}
		}
	}

	// Prodej dle počtu kusů
	async function handleSellByQty(stock: PortfolioStock, qty: number, index: number) {
		if (!qty || qty <= 0) {
			alert('Zadejte platný počet kusů pro prodej');
			return;
		}
		const res = await fetch('/api/portfolio/add', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				userId: localStorage.getItem('id'),
				ticker: stock.ticker,
				amount: -qty, // záporná hodnota = prodej
				buyDate: new Date().toISOString().split('T')[0]
			})
		});
		if (res.ok) {
			alert('Prodej proběhl úspěšně');
			sellQty[index] = 0;
			window.location.reload();
			await loadPortfolio(); // znovu načíst data
		} else {
			alert('Chyba při prodeji');
		}
	}

	// Prodej dle částky (USD)
	function handleSellByAmount(stock: PortfolioStock, usd: number, index: number) {
		if (!usd || usd <= 0) {
			alert('Zadejte platnou částku');
			return;
		}
		const currentPrice = currentPrices[stock.ticker] ?? 0;
		if (currentPrice <= 0) {
			alert('Neznámá aktuální cena pro ' + stock.ticker);
			return;
		}
		// Kolik kusů to odpovídá
		const qty = usd / currentPrice;
		handleSellByQty(stock, qty, index);
	}
</script>

<div class="flex flex-col gap-4 rounded bg-white p-4 shadow-md">
	<!-- Hlavní statistiky portfolia -->
	<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
		<div class="text-lg font-semibold text-gray-700">
			Hodnota portfolia: {currentPortfolioValue.toFixed(2)} USD
		</div>
		<div class="text-sm text-gray-600">
			Investováno: {totalInvested.toFixed(2)} USD
		</div>
		<div class="text-sm">
			<!-- Zisk / ztráta -->
			{#if difference >= 0}
				<span class="text-green-600">+{difference.toFixed(2)} USD</span>
			{:else}
				<span class="text-red-600">{difference.toFixed(2)} USD</span>
			{/if}
		</div>
	</div>

	<!-- Plátno pro graf (hodnota vs. investováno) -->
	<div class="h-64">
		<canvas bind:this={canvasElem} class="h-full w-full"></canvas>
	</div>

	<!-- Tabulka sjednocených pozic (vážená průměrná cena) -->
	{#if aggregatedPositions.length > 0}
		<div class="mt-4">
			<h2 class="mb-2 text-lg font-semibold">Moje akcie (sjednocené)</h2>
			<div class="overflow-x-auto">
				<table class="w-full text-left text-sm">
					<thead>
						<tr class="border-b">
							<th class="p-2">Ticker</th>
							<th class="p-2">Celkové množství</th>
							<th class="p-2">Průměrná nákupní cena</th>
							<th class="p-2">Aktuální cena</th>
							<th class="p-2">Aktuální hodnota</th>
							<th class="p-2">Prodej</th>
						</tr>
					</thead>
					<tbody>
						{#each aggregatedPositions as stock, i}
							<tr class="border-b hover:bg-gray-50">
								<td class="p-2">{stock.ticker}</td>
								<td class="p-2">{stock.amount.toFixed(2)}</td>
								<td class="p-2">
									{stock.priceAtTime.toFixed(2)} USD
								</td>
								<!-- Místo volání async funkce v šabloně čteme currentPrices -->
								<td class="p-2">
									{(currentPrices[stock.ticker] ?? 0).toFixed(2)} USD
								</td>
								<td class="p-2">
									{((currentPrices[stock.ticker] ?? 0) * stock.amount).toFixed(2)} USD
								</td>
								<td class="p-2">
									<!-- Prodej podle počtu kusů -->
									<div class="mb-1 flex items-center space-x-2">
										<input
											type="number"
											bind:value={sellQty[i]}
											min="0"
											step="any"
											placeholder="Kusů"
											class="w-16 border p-1 text-sm"
										/>
										<button
											class="rounded bg-red-500 px-2 py-1 text-xs font-semibold text-white hover:bg-red-600"
											on:click={() => handleSellByQty(stock, sellQty[i], i)}
										>
											Prodat
										</button>
									</div>
									<!-- Prodej podle částky (USD) -->
									<div class="flex items-center space-x-2">
										<input
											type="number"
											bind:value={sellAmount[i]}
											min="0"
											step="any"
											placeholder="USD"
											class="w-16 border p-1 text-sm"
										/>
										<button
											class="rounded bg-red-500 px-2 py-1 text-xs font-semibold text-white hover:bg-red-600"
											on:click={() => handleSellByAmount(stock, sellAmount[i], i)}
										>
											Prodat
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>
