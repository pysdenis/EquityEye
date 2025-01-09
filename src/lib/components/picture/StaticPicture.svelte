<script lang="ts">
	import { parseSourceSet } from "./parseSourceSet.js";
	import type { SourceSetQuery } from "./SourceSetQuery.js";
	import StaticPictureInner from "./StaticPictureInner.svelte";

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
	export let lightboxId: string | undefined = undefined;
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

{#if lightboxId}
	<a class="block {className}" href={image} data-fslightbox={lightboxId} data-type="image" data-caption={alt}>
		<StaticPictureInner
			{width}
			{height}
			{imgClass}
			{loading}
			{image}
			{alt}
			{sourcesets}
			bind:naturalHeight
			bind:naturalWidth
		/>
	</a>
{:else}
	<div class={className}>
		<StaticPictureInner
			{width}
			{height}
			{imgClass}
			{loading}
			{image}
			{alt}
			{sourcesets}
			bind:naturalHeight
			bind:naturalWidth
		/>
	</div>
{/if}
