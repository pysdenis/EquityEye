<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import SmallArticleCard from '../../../lib/components/SmallArticleCard.svelte';
	import Loading from '../../../lib/components/Loading.svelte';
	import filter from "$lib/assets/icons/filter.svg?raw";
	import mglass from "$lib/assets/icons/mglass.svg?raw";
	import Icon from '../../../lib/components/Icon.svelte';

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
	let userId = '';
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
		userId = localStorage.getItem('id') || '';

		if (selectedDate) {
			url.searchParams.set('from', selectedDate);
		}
		if (selectedDateTo) {
			url.searchParams.set('to', selectedDateTo);
		}
		if (userId) {
			url.searchParams.set('userId', userId);
		}

		if (language !== 'en') {
			url.searchParams.set('language', language);
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

	let showFilters = false;

	onMount(fetchNews);
</script>

<div class="container mx-auto p-6">
	<h1 class="mb-6 text-3xl font-bold">Novinky o akciích</h1>

	<!-- Searchbar -->
	<div class="mb-6 flex items-center gap-4">
		<form class="flex-1 flex">
			<input
				type="text"
				placeholder="Vyhledat novinky..."
				bind:value={searchQuery}
				class="flex-1 rounded-l-lg border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
			<button
				on:click={fetchNews}
				class="rounded-r-lg bg-blue-600 px-4 py-2 font-medium text-white shadow duration-300 transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
			>
				<Icon icon={mglass} class="w-5 h-5 text-white" />
			</button>
		</form>
		<!-- Filter Button -->
		<div class="">
			<button
				on:click={() => showFilters = !showFilters}
				class="rounded-lg bg-gray-600 px-4 py-3 font-medium text-white shadow hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
			>
				<Icon icon={filter} class="w-5 h-5 text-white" />
			</button>
		</div>
	</div>


	<!-- Filters Modal -->
	{#if showFilters}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
				<h2 class="text-xl font-bold mb-4">Filtry</h2>
				<div class="grid gap-4">
					<div>
						<label for="portfolio" class="mb-2 block text-sm font-medium text-gray-700">Akcie z portfolia:</label>
						<select
							id="portfolio"
							bind:value={userId}
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
				<div class="mt-6 flex justify-end">
					<button
						on:click={() => showFilters = false}
						class="rounded-lg bg-red-600 px-4 py-2 font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
					>
						Zavřít
					</button>
				</div>
			</div>
		</div>
	{/if}

	{#if $loading}
		<Loading />
	{:else if $error}
		<p class="font-medium text-red-600">Chyba: {$error}</p>
	{:else if $news.length > 0}
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each $news as article, i}
				<SmallArticleCard {article} {i} />
			{/each}
		</div>
	{:else}
		<p class="text-gray-600">Žádné novinky k zobrazení.</p>
	{/if}
</div>
