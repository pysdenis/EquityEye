<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { HTMLCanvasAttributes } from 'svelte/elements';
	import type { Writable } from 'svelte/store';

	interface Props extends HTMLCanvasAttributes {
		message: Writable<string>;
		type: 'error' | 'success';
		closeLogger: () => void;
	}

	const { message, type, closeLogger }: Props = $props();

	onMount(() => {
		document.body.style.overflow = 'hidden';
		setTimeout(document.body.style.overflow = "auto", 3000);
		setTimeout(closeLogger, 3500);
	});
</script>

<div class="absolute inset-0 z-[5555] flex h-screen overflow-hidden">
	<div
		class="absolute left-1/2 top-1/2 z-20 flex h-20 translate-x-[-50%] translate-y-[-50%] flex-col gap-4 rounded-lg p-4 shadow-lg"
		class:bg-red-100={type === 'error'}
		class:bg-green-100={type === 'success'}
		title={type === 'error' ? 'Chyba' : 'Úspěch'}
	>
		<div class="flex flex-col items-center justify-center gap-2">
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
		onclick={closeLogger}
	></button>
</div>
