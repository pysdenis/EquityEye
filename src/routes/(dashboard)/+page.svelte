<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '../../lib/components/Icon.svelte';
	import person from '$lib/assets/icons/person.svg?raw';
	import arrow from '$lib/assets/icons/arrow.svg?raw';
	import mglass from '$lib/assets/icons/mglass.svg?raw';
	import bell from '$lib/assets/icons/news.svg?raw';
	import dashboard from '$lib/assets/icons/dashboard.svg?raw';
	import spark from '$lib/assets/icons/graph.svg?raw';
	import type { IUser } from '../../lib/models/User';
	import { popularTickets } from '../../lib/consts/popularTickets';
	import LineChart from '../../lib/components/LineChart.svelte';
	import Loading from '../../lib/components/Loading.svelte';

	let username = '';
	let portfolioValue = 0;
	let portfolioChange = 0;
	let stocks: { ticker: string; price: number; change: number }[] = [];
	let lastNotification: { message: string; createdAt: string } | null = null;
	let loading = true;
	let refreshing = false;
	let currentNews: { title: string; description: string; url: string } | null = null;
	let popularStocks: { ticker: string; price: number; change: number }[] = [];
	let loadingPopularStocks = true;

	interface PortfolioStock {
		ticker: string;
		amount: number;
		priceAtTime: number;
		dateAdded: string;
	}

	interface Portfolio {
		stocks: PortfolioStock[];
	}

	let portfolio: Portfolio | null = null;
	let currentPrices: Record<string, number> = {};

	onMount(async () => {
		console.log('onMount - začínám načítat data...');
		await loadData();
		await loadNews();
		await loadPortfolio();
		await loadPopularStocks();
		console.log('onMount - všechna data načtena');
	});

	let userData: IUser | null = null;

	onMount(async () => {
		const token = localStorage.getItem('token');
		try {
			const response = await fetch('/api/dashboard', {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			if (response.ok) {
				userData = await response.json();
			} else {
				console.error('Failed to fetch user data');
			}
		} catch (error) {
			console.error('Error fetching user data:', error);
		}
	});

	let usersStocks: string[] = [];

	async function loadPortfolio() {
		try {
			const url = new URL('/api/portfolio/get', window.location.origin);
			url.searchParams.set('userId', localStorage.getItem('id')!);
			const res = await fetch(url.toString());
			if (!res.ok) throw new Error('Chyba při načítání portfolia');
			portfolio = await res.json();

			if (portfolio && portfolio.stocks) {
				// Načteme aktuální ceny pro každý ticker
				await loadCurrentPrices(portfolio.stocks);

				// Aktualizujeme hodnotu portfolia a změnu
				updatePortfolioValue();
			}
		} catch (err) {
			console.error(err);
		}
	}

	async function loadCurrentPrices(stocks: PortfolioStock[]) {
		const uniqueTickers = [...new Set(stocks.map((s) => s.ticker))];

		for (const ticker of uniqueTickers) {
			try {
				const url = new URL(`/api/stockNameDate`, window.location.origin);
				url.searchParams.set(`tickerSymbol`, ticker.toUpperCase());
				url.searchParams.set(`multiplier`, '5');
				url.searchParams.set(`timespan`, 'minute');
				url.searchParams.set(`from`, new Date().toISOString().split('T')[0]);

				const res = await fetch(url.toString());
				if (!res.ok) throw new Error(`API error: ${res.status}`);

				const stockData = await res.json();
				if (stockData.length > 0) {
					currentPrices[ticker] = stockData[stockData.length - 1].y;
				}
			} catch (error) {
				console.error(`Error fetching price for ${ticker}:`, error);
			}
		}
	}

	function updatePortfolioValue() {
		if (!portfolio || !portfolio.stocks) return;

		let totalValue = 0;
		let previousTotalValue = 0;
		const stocksMap = new Map<string, { price: number; change: number; amount: number }>();

		// Nejprve sloučíme všechny akcie se stejným tickerem
		portfolio.stocks.forEach((stock) => {
			const currentPrice = currentPrices[stock.ticker] || 0;
			const stockValue = currentPrice * stock.amount;
			totalValue += stockValue;

			// Výpočet změny za 24h pro jednotlivé akcie
			const previousPrice = stock.priceAtTime;
			const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;

			// Přidáme hodnotu do předchozí celkové hodnoty
			previousTotalValue += previousPrice * stock.amount;

			// Pokud už máme tento ticker v mapě, aktualizujeme jeho hodnoty
			if (stocksMap.has(stock.ticker)) {
				const existing = stocksMap.get(stock.ticker)!;
				existing.amount += stock.amount;
				// Použijeme vážený průměr pro změnu
				existing.change =
					(existing.change * existing.amount + priceChange * stock.amount) /
					(existing.amount + stock.amount);
			} else {
				// Pokud ticker ještě nemáme, přidáme ho
				stocksMap.set(stock.ticker, {
					price: currentPrice,
					change: priceChange,
					amount: stock.amount
				});
			}
		});

		// Převedeme mapu na pole pro zobrazení
		stocks = Array.from(stocksMap.entries()).map(([ticker, data]) => ({
			ticker,
			price: data.price,
			change: data.change
		}));

		portfolioValue = totalValue;
		// Výpočet celkové změny portfolia
		portfolioChange =
			previousTotalValue > 0 ? ((totalValue - previousTotalValue) / previousTotalValue) * 100 : 0;
	}

	const handleAddStock = (stock: string | undefined) => {
		window.location.href = `/akcie`;
	};

	async function loadData() {
		loading = true;
		const token = localStorage.getItem('token');
		const res = await fetch('/api/dashboard', {
			headers: { Authorization: `Bearer ${token}` }
		});
		if (res.ok) {
			const data = await res.json();
			username = data.username;
			portfolioValue = data.portfolioValue;
			portfolioChange = data.portfolioChange;
			stocks = data.stocks;
			lastNotification = data.lastNotification;
		}
		loading = false;
	}

	async function refresh() {
		refreshing = true;
		await loadData();
		refreshing = false;
	}

	function formatDate(date: string) {
		return new Date(date).toLocaleString('cs-CZ', {
			hour: '2-digit',
			minute: '2-digit',
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	function getBestStock() {
		if (!stocks.length) return null;
		return stocks.reduce((best, s) => (s.change > best.change ? s : best), stocks[0]);
	}

	async function loadNews() {
		try {
			const url = new URL('/api/news', window.location.origin);
			url.searchParams.set('query', 'stocks');
			url.searchParams.set('sortBy', 'publishedAt');
			url.searchParams.set('language', 'cs');

			const response = await fetch(url.toString());
			if (response.ok) {
				const data = await response.json();
				if (data.articles && data.articles.length > 0) {
					currentNews = {
						title: data.articles[0].title,
						description: data.articles[0].description,
						url: data.articles[0].url
					};
				}
			}
		} catch (error) {
			console.error('Chyba při načítání novinek:', error);
		}
	}

	async function loadPopularStocks() {
		loadingPopularStocks = true;
		try {
			const newStocks: { ticker: string; price: number; change: number }[] = [];

			for (const ticker of popularTickets.slice(0, 6)) {
				const url = new URL(`/api/stockNameDate`, window.location.origin);
				url.searchParams.set(`tickerSymbol`, ticker.toUpperCase());
				url.searchParams.set(`multiplier`, '5');
				url.searchParams.set(`timespan`, 'minute');
				url.searchParams.set(`from`, new Date().toISOString().split('T')[0]);

				const res = await fetch(url.toString());
				if (!res.ok) throw new Error(`API error: ${res.status}`);

				const stockData = await res.json();

				if (stockData.length > 0) {
					const currentPrice = stockData[stockData.length - 1].y;
					const previousPrice = stockData[0].y;
					const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;

					newStocks.push({
						ticker,
						price: currentPrice,
						change: priceChange
					});
				}
			}
			popularStocks = newStocks;
		} catch (error) {
			console.error('Error fetching popular stocks:', error);
		} finally {
			loadingPopularStocks = false;
		}
	}
</script>

<main class="flex min-h-screen flex-col items-center justify-start max-lg:px-4">
	<!-- Topbar -->
	<div class="mb-8 flex w-full items-center gap-3">
		<Icon icon={person} class="h-9 w-9 rounded-full bg-white p-2 text-sky-700 shadow" />
		<span class="text-lg font-semibold tracking-wide text-slate-800">{username}</span>
		<div class="flex-1"></div>
		<button
			on:click={refresh}
			class="group relative flex h-9 w-9 items-center justify-center rounded-full bg-white shadow transition hover:bg-sky-100 disabled:opacity-60"
			disabled={refreshing}
		>
			<Icon
				icon={dashboard}
				class="h-5 w-5 text-sky-700 transition-transform group-hover:scale-110"
			/>
			<span
				class="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs text-slate-400 opacity-0 transition group-hover:opacity-100"
				>Obnovit</span
			>
		</button>
	</div>

	<!-- Cards grid -->
	<div class="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		<!-- Portfolio hodnota -->
		<div
			class="group relative flex flex-col items-start gap-2 bg-white p-6 shadow-lg transition hover:shadow-xl"
		>
			<div class="mb-1 flex items-center gap-2">
				<Icon icon={spark} class="h-6 w-6 text-sky-600" />
				<span class="text-sm font-medium text-slate-500">Hodnota portfolia</span>
			</div>
			{#if loading}
				<div class="mb-1 h-8 w-32 animate-pulse rounded bg-slate-100"></div>
			{:else}
				<div class="text-2xl font-bold text-slate-800">
					{portfolioValue.toLocaleString('cs-CZ', { maximumFractionDigits: 2 })} $
				</div>
				<div
					class="flex items-center gap-1 text-base font-semibold {portfolioChange >= 0
						? 'text-green-500'
						: 'text-red-500'}"
				>
					<Icon
						icon={arrow}
						class={portfolioChange >= 0 ? 'h-4 w-4 rotate-0' : 'h-4 w-4 rotate-180'}
					/>
					{portfolioChange >= 0 ? '+' : ''}{portfolioChange.toFixed(2)} %
				</div>
			{/if}
			<span
				class="absolute right-4 top-4 text-xs text-slate-400 opacity-0 transition group-hover:opacity-100"
				>Celková hodnota</span
			>
		</div>

		<!-- Moje akcie -->
		<div
			class="group relative flex flex-col gap-2 bg-white p-6 shadow-lg transition hover:shadow-xl"
		>
			<div class="mb-1 flex items-center gap-2">
				<Icon icon={mglass} class="h-6 w-6 text-sky-600" />
				<span class="text-sm font-medium text-slate-500">Top 3 z mých akcií</span>
			</div>
			{#if loading}
				<div class="mb-1 h-6 w-24 animate-pulse rounded bg-slate-100"></div>
			{:else if stocks.length === 0}
				<div class="text-sm text-slate-400">Žádné akcie</div>
			{:else}
				{#each stocks.slice(-3) as stock}
					<div
						class="flex w-full items-center justify-between rounded-lg px-2 py-1 transition hover:bg-slate-50 {getBestStock()
							?.ticker === stock.ticker
							? 'border border-sky-200 bg-sky-50'
							: ''}"
					>
						<span class="font-semibold text-slate-700">{stock.ticker}</span>
						<span class="text-sm text-slate-600"
							>{stock.price.toLocaleString('cs-CZ', { maximumFractionDigits: 2 })} $</span
						>
						<span
							class="text-sm font-semibold {stock.change >= 0 ? 'text-green-500' : 'text-red-500'}"
						>
							{stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} %
						</span>
					</div>
				{/each}
			{/if}
			<span
				class="absolute right-4 top-4 text-xs text-slate-400 opacity-0 transition group-hover:opacity-100"
				>Top 3 z portfolia</span
			>
		</div>

		<!-- Zpráva dne -->
		{#if currentNews}
			<a
				href={currentNews.url}
				target="_blank"
				class="group relative flex flex-col items-start gap-2 bg-gradient-to-br from-yellow-100 to-yellow-50 p-6 shadow-lg transition hover:shadow-xl"
			>
				<div class="mb-1 flex items-center gap-2">
					<Icon icon={spark} class="h-6 w-6 text-yellow-500" />
					<span class="font-semibold text-yellow-700">Zpráva dne</span>
				</div>
				<h3 class="mb-2 duration-300 group-hover:text-black lg:text-lg">{currentNews.title}</h3>
				<span
					class="absolute right-4 top-4 text-xs text-yellow-600 opacity-0 transition group-hover:opacity-100"
					>Aktuální novinka</span
				>
			</a>
		{:else}
			<div
				class="group relative flex flex-col items-start gap-2 bg-gradient-to-br from-yellow-100 to-yellow-50 p-6 shadow-lg transition hover:shadow-xl"
			>
				<div class="mb-1 flex items-center gap-2">
					<Icon icon={spark} class="h-6 w-6 text-yellow-500" />
					<span class="font-semibold text-yellow-700">Zpráva dne</span>
				</div>
				<div class="text-sm text-yellow-900">Načítání novinek...</div>
				<span
					class="absolute right-4 top-4 text-xs text-yellow-600 opacity-0 transition group-hover:opacity-100"
					>Aktuální novinka</span
				>
			</div>
		{/if}
	</div>

	<div class="mt-6 grid w-full grid-cols-1 gap-6 md:grid-cols-2">
		<div
			class="group relative flex flex-col gap-2 bg-white p-6 shadow-lg transition hover:shadow-xl"
		>
			<div class="mb-1 flex items-center gap-2">
				<Icon icon={mglass} class="h-6 w-6 text-sky-600" />
				<span class="text-sm font-medium text-slate-500">Moje akcie</span>
			</div>
			{#if loading}
				<div class="mb-1 h-6 w-24 animate-pulse rounded bg-slate-100"></div>
			{:else if stocks.length === 0}
				<div class="text-sm text-slate-400">Žádné akcie</div>
			{:else}
				{#each stocks as stock}
					<div
						class="flex w-full items-center justify-between rounded-lg px-2 py-1 transition hover:bg-slate-50 {getBestStock()
							?.ticker === stock.ticker
							? 'border border-sky-200 bg-sky-50'
							: ''}"
					>
						<span class="font-semibold text-slate-700">{stock.ticker}</span>
						<span class="text-sm text-slate-600"
							>{stock.price.toLocaleString('cs-CZ', { maximumFractionDigits: 2 })} $</span
						>
						<span
							class="text-sm font-semibold {stock.change >= 0 ? 'text-green-500' : 'text-red-500'}"
						>
							{stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} %
						</span>
					</div>
				{/each}
			{/if}
			<span
				class="absolute right-4 top-4 text-xs text-slate-400 opacity-0 transition group-hover:opacity-100"
				>Všechny mé akcie</span
			>
		</div>
		<div
			class="group relative flex flex-col gap-2 bg-white p-6 shadow-lg transition hover:shadow-xl"
		>
			<div class="mb-1 flex items-center gap-2">
				<Icon icon={mglass} class="h-6 w-6 text-sky-600" />
				<span class="text-sm font-medium text-slate-500">Populární akcie</span>
			</div>
			{#if loadingPopularStocks}
				<div class="mb-1 h-6 w-24 animate-pulse rounded bg-slate-100"></div>
			{:else if popularStocks.length === 0}
				<div class="text-sm text-slate-400">Žádné akcie</div>
			{:else}
				{#each popularStocks as stock}
					<div
						class="flex w-full items-center justify-between rounded-lg px-2 py-1 transition hover:bg-slate-50"
					>
						<span class="font-semibold text-slate-700">{stock.ticker}</span>
						<span class="text-sm text-slate-600"
							>{stock.price.toLocaleString('cs-CZ', { maximumFractionDigits: 2 })} $</span
						>
						<span
							class="text-sm font-semibold {stock.change >= 0 ? 'text-green-500' : 'text-red-500'}"
						>
							{stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} %
						</span>
					</div>
				{/each}
			{/if}
			<span
				class="absolute right-4 top-4 text-xs text-slate-400 opacity-0 transition group-hover:opacity-100"
				>Populární akcie</span
			>
		</div>
	</div>
</main>
