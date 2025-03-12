<script lang="ts">
	import { page } from '$app/stores';
	import Loading from '$lib/components/Loading.svelte';
	import { onMount } from 'svelte';
	import StaticPicture from '../../../../lib/components/picture/StaticPicture.svelte';
	import Icon from '../../../../lib/components/Icon.svelte';
	import arrow from '$lib/assets/icons/arrow.svg?raw';

	interface Article {
		title: string;
		description: string;
		url: string;
		urlToImage: string;
		source: {
			name: string;
		};
		publishedAt: string;
		content: string;
	}

	let article: Article;

	onMount(async () => {
		const targetUrl = decodeURIComponent($page.params.id); // Dekódujeme URL
		const apiUrl = new URL('/api/news', window.location.origin);

		try {
			const response = await fetch(apiUrl.toString());
			if (!response.ok) throw new Error('Chyba při načítání novinek');

			const data = await response.json();
			if (data && Array.isArray(data.articles)) {
				article = data.articles.find((article: Article) => article.url === targetUrl); // Hledáme správnou novinku
				console.log(targetUrl + "------------targetUrl");
				for (const article of data.articles) {
					if (article.url === targetUrl) {
						console.log(article);
						break;
					}
				}
			} else {
				throw new Error('Response does not contain articles array');
			}

			if (!article) {
				throw new Error('Article not found');
			}
		} catch (err) {
			console.error(err);
		}
	});

	function shortenText(text: string, limit: number = 166): string {
		if (text.length <= limit) return text;
		return text.slice(0, limit) + "...";
	} //TODO add to lib
</script>

<!-- krok zpet -->
<a href="/novinky" class="flex gap-4 items-center mt-2"><Icon icon={arrow} class="w-3 h-3 rotate-180" />
	Zpět na novinky
</a>
{#if article}
	<div class="max-w-4xl mx-auto p-4 pt-0">
		<h1 class="text-3xl font-bold mb-4">{article.title}</h1>
		<StaticPicture
			image={article.urlToImage}
			alt="Obrázek článku"
			width={500}
			height={0}
			imgClass="object-cover h-full w-full rounded-lg"
			class="w-full h-full max-h-[25rem] overflow-hidden mb-4"
		/>
		<p class="text-lg text-gray-700 mb-4">{article.description}</p>
		<p class="text-gray-600">{shortenText(article.content, 190)}
			<a href={article.url} target="_blank" class="text-blue-500 hover:underline"> Číst celý článek</a>
		</p>
	</div>
{:else}
	<Loading />
{/if}
