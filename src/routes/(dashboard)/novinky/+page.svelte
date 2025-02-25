<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import SmallArticleCard from '../../../lib/components/SmallArticleCard.svelte';

	interface Article {
		title: string;
		description: string;
		url: string;
		source: {
			name: string;
		};
		publishedAt: string;
		urlToImage: string;
	}

	let searchQuery = '';
	let selectedPortfolioStock = '';
	let selectedDate = '';
	let selectedDateTo = '';
	let sortBy = 'publishedAt';
	let language = 'en';
	let news = writable<Article[]>([]);
	let loading = writable(false);
	let error = writable('');

	async function fetchNews() {
		loading.set(true);
		error.set('');

		const url = new URL('/api/news', window.location.origin);
		url.searchParams.set('query', searchQuery || 'stocks');
		url.searchParams.set('sortBy', sortBy);

		if (selectedDate) {
			url.searchParams.set('from', selectedDate);
		}
		if (selectedDateTo) {
			url.searchParams.set('to', selectedDateTo);
		}
		if (selectedPortfolioStock) {
			url.searchParams.set('userPortfolio', selectedPortfolioStock);
		}

		try {
			const response = await fetch(url.toString());
			const data = await response.json();

			if (response.ok) {
				news.set(data.articles || []);
			} else {
				throw new Error(data.error || 'Nepodařilo se načíst novinky.');
			}
		} catch (err) {
			error.set((err as Error).message);
		} finally {
			loading.set(false);
		}
	}

	onMount(fetchNews);
</script>

<div class="container mx-auto p-6">
	<h1 class="mb-6 text-3xl font-bold">Novinky o akciích</h1>

	<!-- Searchbar -->
	<div class="mb-6 flex items-center gap-4">
		<input
			type="text"
			placeholder="Vyhledat novinky..."
			bind:value={searchQuery}
			class="flex-1 rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
		/>
		<button
			on:click={fetchNews}
			class="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
		>
			Hledat
		</button>
	</div>

	<!-- Filtry -->
	<div class="mb-6 grid gap-4 md:grid-cols-3">
		<div>
			<label for="portfolio" class="mb-2 block text-sm font-medium text-gray-700"
				>Akcie z portfolia:</label
			>
			<select
				id="portfolio"
				bind:value={selectedPortfolioStock}
				on:change={fetchNews}
				class="w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
			>
				<option value="">Všechny akcie</option>
				<option value="AAPL">Apple</option>
				<option value="TSLA">Tesla</option>
				<option value="GOOGL">Google</option>
			</select>
		</div>

		<div>
			<label for="date" class="mb-2 block text-sm font-medium text-gray-700">Datum od:</label>
			<input
				type="date"
				id="date"
				bind:value={selectedDate}
				on:change={fetchNews}
				class="w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
		</div>

		<div>
			<label for="dateTo" class="mb-2 block text-sm font-medium text-gray-700">Datum do:</label>
			<input
				type="date"
				id="dateTo"
				class="w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
				on:change={fetchNews}
				bind:value={selectedDateTo}
			/>
		</div>

		<div>
			<label for="language" class="mb-2 block text-sm font-medium text-gray-700">Jazyk:</label>
			<select
				id="language"
				bind:value={language}
				on:change={fetchNews}
				class="w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
			>
				<option value="en">Angličtina</option>
				<option value="cs">Čestina</option>
				<option value="de">Němčina</option>
				<option value="fr">Francouzština</option>
				<option value="es">Španělština</option>
			</select>
		</div>

		<div>
			<label for="sortBy" class="mb-2 block text-sm font-medium text-gray-700">Řazení:</label>
			<select
				id="sortBy"
				bind:value={sortBy}
				on:change={fetchNews}
				class="w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
			>
				<option value="publishedAt">Nejnovější</option>
				<option value="popularity">Popularita</option>
				<option value="relevancy">Relevance</option>
			</select>
		</div>
	</div>

	{#if $loading}
		<p class="font-medium text-blue-600">Načítám novinky...</p>
	{:else if $error}
		<p class="font-medium text-red-600">Chyba: {$error}</p>
	{:else if $news.length > 0}
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each $news as article}
				<SmallArticleCard {article} />
			{/each}
		</div>
	{:else}
		<p class="text-gray-600">Žádné novinky k zobrazení.</p>
	{/if}
</div>
