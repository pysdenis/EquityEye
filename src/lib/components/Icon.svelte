<script lang="ts">
	let iconClass = "";
	export { iconClass as class };
	export let icon: string;

	/* eslint-disable svelte/no-at-html-tags */
</script>

<div class="icon aspect-square flex-shrink-0 [&>svg]:h-full [&>svg]:w-full {iconClass}">
	{@html icon}
</div>
