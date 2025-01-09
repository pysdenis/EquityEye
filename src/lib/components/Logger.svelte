<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { Writable } from 'svelte/store';

	export let message: Writable<string>;
	export let type: 'error' | 'success' = 'error';

	const dispatch = createEventDispatcher();

	function closeLogger() {
		dispatch('close');
	}

	onMount(() => {
		console.log();
		setTimeout(closeLogger, 3000);
	});
</script>

<div class="absolute inset-0 z-10 flex">
	<div
		class="flex flex-col absolute z-20 top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg shadow-lg p-4"
		class:bg-red-100={type === 'error'}
		class:bg-green-100={type === 'success'}
		title={type === 'error' ? 'Chyba' : 'Úspěch'}
	>
		<div class="flex items-center flex-col gap-2 justify-center">
			<span>
				{$message}
			</span>
		</div>
	</div>
	<!-- svelte-ignore a11y_consider_explicit_label -->
	<button
		type="button"
		tabindex="-1"
		class="bg-secondaryBlack-200/75 grid h-full w-full flex-1 cursor-default place-items-center backdrop-blur-sm"
		on:click={closeLogger}
	></button>
</div>
