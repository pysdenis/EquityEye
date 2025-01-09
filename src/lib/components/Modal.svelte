<!-- Modal.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let message: string = 'Opravdu chcete tuto akci provést?';
	const dispatch = createEventDispatcher();

	function closeModal() {
		dispatch('close');
	}

	function confirmAction() {
		dispatch('confirm');
	}
</script>

<div class="absolute inset-0 z-10 flex">
	<div class="flex flex-col absolute z-20 top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] gap-5 bg-white rounded-lg shadow-lg p-4">
		<p class="text-text text-center text-md">{message}</p>
		<div class="flex justify-between px-6">
			<button class="bg-blue-900 duration-300 transition-all hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" on:click={confirmAction}>Potvrdit</button>
			<button class="bg-red-900 duration-300 transition-all hover:bg-gray-700 text-white font-bold py-2 px-4 rounded" on:click={closeModal}>Zavřít</button>
		</div>
	</div>
	<button
		type="button"
		tabindex="-1"
		class="bg-gray-500 bg-opacity-30 grid h-full w-full flex-1 cursor-default place-items-center backdrop-blur-sm"
		on:click={closeModal}
	></button>
</div>
