<script lang="ts">
	import { localizeDate } from '../scripts/date';
	import StaticPicture from './picture/StaticPicture.svelte';

	interface Article {
		title: string;
		description: string;
		url: string;
		urlToImage: string;
		source: {
			name: string;
		};
		publishedAt: string;
	}

	export let article: Article;
	export let date = new Date();
	export let query: string;

	let param = query.length > 0 ? '?q=' + query : '';

	function shortenText(text: string, limit: number = 166): string {
		if (text.length <= limit) return text;
		return text.slice(0, limit) + '...';
	}
</script>

{#if new Date(article.publishedAt) <= date}
	<div class="group relative overflow-hidden bg-white shadow-md duration-300 hover:scale-105">
		<span class="absolute right-0 bg-primary px-2 py-1 text-2xs text-white"
			>{localizeDate(article.publishedAt)}</span
		>
		{#if article.urlToImage}
			<a href={'/novinky/' + encodeURIComponent(article.url) + param}>
				<StaticPicture
					image={article.urlToImage}
					loading="eager"
					alt={article.title}
					width={1140}
					height={0}
					imgClass="object-cover h-full w-full"
					class="h-44 w-full overflow-hidden"
				/>
			</a>
		{:else}
			<div class="h-44 w-full bg-gray-200"></div>
		{/if}
		<div class="p-4">
			<span>
				<a href={'/novinky/' + encodeURIComponent(article.url) + param}>
					<h2 class="m-0 text-sm font-bold text-primary md:text-md">
						{shortenText(article.title, 40)}
					</h2>
				</a>
				<a href={article.url} target="_blank">
					<span class="text-3xs text-gray-500">{article.source.name}</span>
				</a>
			</span>
			{#if article.description}
				<p class="mt-2 text-3xs text-black">{shortenText(article.description)}</p>
			{/if}
		</div>
	</div>
{/if}
