<script lang="ts">
	import { parseSourceSet } from "./parseSourceSet.js";
	import type { SourceSetQuery } from "./SourceSetQuery.js";
	import { onMount } from "svelte";

	let className = "";
	export { className as class };

	export let width: number;
	export let height: number;
	export let imgClass = "";
	export let loading: "eager" | "lazy" = "lazy";
	export let image: string;
	export let alt: string;
	export let sourcesets: Partial<Record<SourceSetQuery, string>> = {};
	export let preload: boolean | undefined = undefined;
	export let naturalHeight: number | undefined = undefined;
	export let naturalWidth: number | undefined = undefined;
</script>

<svelte:head>
	{#if preload}
		{#each Object.entries(sourcesets) as [query, image]}
			<link rel="preload" as="image" imagesrcset={`${image} 1x`} media={parseSourceSet(query)} fetchpriority="high" />
		{/each}
	{/if}
</svelte:head>

<picture>
	{#each Object.entries(sourcesets) as [query, image]}
		<source srcset={`${image} 1x`} type="image/webp" media={parseSourceSet(query)} />
	{/each}

	<img class={imgClass} {alt} src={image} {width} {height} {loading} bind:naturalHeight bind:naturalWidth />
</picture>
