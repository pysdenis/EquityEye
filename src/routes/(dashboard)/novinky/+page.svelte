<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import SmallArticleCard from '../../../lib/components/SmallArticleCard.svelte';
	import Loading from '../../../lib/components/Loading.svelte';
	import filter from '$lib/assets/icons/filter.svg?raw';
	import mglass from '$lib/assets/icons/mglass.svg?raw';
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
	let results: string | any[] = [];

	async function fetchNews() {
		loading.set(true);
		error.set('');

		const url = new URL('/api/news', window.location.origin);
		url.searchParams.set('query', searchQuery || 'akcie');
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

		results = [];
	}

	const searchNews = () => {
		if (searchQuery.length < 1) {
			results = [];
			return;
		}

		news.subscribe((value) => {
			results = value.filter((article) =>
				article.title.toLowerCase().includes(searchQuery.toLowerCase())
			);
		})();

		results = results.slice(0, 10);
	};

	let showFilters = false;

	onMount(fetchNews);
</script>

<div class="relative">
	<div class="pb-6">
		<h1 class="m-0 mb-6 p-0 text-3xl font-bold">Novinky ze světa akcií</h1>

		<!-- Searchbar -->
		<div class="mb-6 flex flex-row items-center justify-center gap-4 md:justify-normal">
			<form class="flex flex-1">
				<input
					type="text"
					placeholder="Vyhledat novinky..."
					bind:value={searchQuery}
					on:input={searchNews}
					class="flex-1 rounded-l-lg border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<button
					on:click={fetchNews}
					class="rounded-r-lg bg-blue-600 px-4 py-2 font-medium text-white shadow transition-all duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<Icon icon={mglass} class="h-5 w-5 text-white" />
				</button>
			</form>
			<!-- Filter Button -->
			<div class="hidden md:block">
				<button
					on:click={() => (showFilters = !showFilters)}
					class="w-full rounded-lg bg-gray-600 px-4 py-3 font-medium text-white shadow hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 md:w-auto"
				>
					<Icon icon={filter} class="h-5 w-5 text-white" />
				</button>
			</div>
		</div>
	</div>

	{#if results.length > 0}
		<ul
			class="absolute z-10 flex w-full flex-col gap-2 rounded-lg border border-gray-300 bg-white p-4 shadow-lg"
		>
			{#each results as article}
				<a
					href={"/novinky/" + encodeURIComponent(article.url)}
					class="flex items-center gap-4 rounded-lg p-2 hover:bg-gray-100"
					title={article.source?.name || 'Unknown Source'}
				>
					<img
						src={article.urlToImage}
						alt={article.title}
						class="h-12 w-12 rounded-lg object-cover"
					/>
					<div class="flex flex-col">
						<p class="font-semibold text-blue-600 hover:underline">{article.title}</p>
						<span class="text-sm text-gray-600"
							>{new Date(article.publishedAt).toLocaleDateString()}</span
						>
					</div>
				</a>
			{/each}
		</ul>
	{/if}
</div>

<!-- Filters Modal -->
{#if showFilters}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
			<h2 class="mb-4 text-xl font-bold">Filtry</h2>
			<div class="grid gap-4">

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
					on:click={() => (showFilters = false)}
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
		{#each $news as article}
			<SmallArticleCard {article} query={searchQuery} />
		{/each}
	</div>
{:else}
	<p class="text-gray-600">Žádné novinky k zobrazení.</p>
{/if}
