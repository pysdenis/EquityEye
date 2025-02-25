<script lang="ts">
	import { localizeDate } from "../scripts/date";
	import StaticPicture from "./picture/StaticPicture.svelte";

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

	function shortenText(text: string, limit: number = 166): string {
		if (text.length <= limit) return text;
		return text.slice(0, limit) + "...";
	}
</script>

{#if new Date(article.publishedAt) <= date}
	<div class="bg-white shadow-md group hover:scale-105 duration-300 overflow-hidden relative">
		<span class="absolute bg-primary text-2xs text-white py-1 px-2 right-0">{localizeDate(article.publishedAt)}</span>
		{#if article.urlToImage}
			<a href="/novinky/{article.url}">
				<StaticPicture image="{article.urlToImage}" loading="eager" alt={article.title} width={1140} height={0} imgClass="object-cover h-full w-full" class="w-full h-44 overflow-hidden" />
			</a>
		{:else}
			<div class="w-full h-44 bg-gray-200"></div>
		{/if}
		<div class="p-4">
			<span>
				<a href="/novinky/{article.url}">
					<h2 class="md:text-md text-sm m-0 font-bold text-primary">{shortenText(article.title, 40)}</h2>
				</a>
				<a href={article.url} target="_blank">
					<span class="text-gray-500 text-3xs">{article.source.name}</span>
				</a>
			</span>
			{#if article.description}
				<p class="text-3xs mt-2 text-black">{shortenText(article.description)}</p>
			{/if}
		</div>
	</div>
{/if}
