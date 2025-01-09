<script lang="ts">
	import { BASE_URL } from "../api/api";
	import { localizeDate } from "../scripts/date";
	import type Article from "../types/Article";
	import StaticPicture from "./picture/StaticPicture.svelte";

	export let article: Article;
	export let date = new Date();
</script>

{#if new Date(article.publishedAt) <= date}
	<a href="/clanky/{article.urlSlug}" class="bg-white grid grid-cols-3 min-h-16 shadow-md hover:scale-105 duration-300 overflow-hidden relative">
		<div class="h-full">
			<span class="absolute bg-primary text-3xs text-white px-1 left-0">{localizeDate(article.publishedAt)}</span>
			{#if article.image}
				<StaticPicture image="{BASE_URL}{article.image}" alt={article.title} width={480} height={0} imgClass="object-cover object-center h-full w-full" class="h-full w-full overflow-hidden" />
			{/if}
		</div>
		<div class="p-1 col-span-2 flex flex-col gap-1 h-full w-full">
			<h2 class="text-2xs m-0 font-bold text-primary">{article.title}</h2>
			<span class="text-gray-500 text-3xs">{article.authorName}</span>
		</div>
	</a>
{/if}
