<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import '$lib/assets/css/main.css';
	import logo from '$lib/assets/images/logo.png';
	import type Category from '$lib/types/Category';
	import menu from '$lib/assets/icons/menu.svg?raw';
	import cross from '$lib/assets/icons/cross.svg?raw';

	export let categories: Category[] = [];
	let showOthers = false;
	let windowScrollY = 0;

	function toggleMenu() {
		const menu = document.querySelector('#menu');
		const closeMenu = document.querySelector('#closeMenu');
		menu?.classList.toggle('hidden');
		closeMenu?.classList.toggle('hidden');
		showOthers = false;

		if (menu?.classList.contains('hidden')) {
			menu?.classList.remove('flex');
		} else {
			menu?.classList.add('flex');
		}
	}
</script>

<svelte:window bind:scrollY={windowScrollY} />

<header class="flex py-5 bg-primary w-full z-10 fixed transition-all duration-300" class:!py-3={windowScrollY > 40} class:shadow-xl={windowScrollY > 40}>
	<div class="container flex items-center justify-between gap-12" class:!lg:justify-center={windowScrollY > 40}>
		<div class="flex h-14 w-14" class:!lg:hidden={windowScrollY > 40}>
			<a href="/">
				<img src={logo} height={56} width={56} alt="Logo THE CAP" />
			</a>
		</div>
		<nav class="text-white hidden h-full lg:flex items-center gap-8 uppercase">
			<span class="flex justify-end items-center">
				<a class="flex text-md" href="/">Domů</a>
			</span>
			{#each categories.slice(0, 4) as category}
				<span class="flex justify-end items-center">
					<a class="flex text-md" href={`/kategorie/${category.urlSlug}`}>{category.name}</a>
				</span>
			{/each}
			{#if categories.length > 4}
				<span class="flex justify-end items-center relative">
					<button type="button" on:click={() => showOthers = !showOthers} class="flex uppercase text-md hover:text-accent duration-300 transition-all cursor-pointer">Další kategorie</button>
					<button type="button" class:hidden={!showOthers} class="fixed inset-0 z-10 h-full w-full cursor-default" tabindex="-1" on:click={() => showOthers = !showOthers}></button>
					<div role="menu" tabindex="0" class="hidden absolute right-0 top-8 mt-2 z-20 py-2 w-48 left-1/2 -translate-x-1/2 bg-white shadow-md" class:!block={showOthers}>
						{#each categories.slice(4) as category}
							<a href={`/kategorie/${category.urlSlug}`} class="block px-4 py-2 text-sm text-gray-700 duration-300 hover:bg-gray-100">{category.name}</a>
						{/each}
					</div>
				</span>
			{/if}
		</nav>
		<button type="button" class="lg:hidden" on:click={toggleMenu}>
			<Icon icon={menu} class="w-8 text-white" />
		</button>
		<nav class="lg:hidden hidden fixed top-0 left-0 min-w-[30%] max-w-[80%] h-full bg-primary z-20 flex-col items-start gap-8 p-10" id="menu">
			<div class="flex justify-between items-center w-full h-20">
				<a href="/">
					<img src={logo} height={80} width={80} alt="Logo THE CAP" />
				</a>
				<button type="button" on:click={toggleMenu}>
					<Icon icon={cross} class="w-6 text-white" />
				</button>
			</div>
			<div class="flex flex-col gap-3" class:!block={showOthers}>
				{#each categories as category}
					<a class="text-white text-lg" href={`/kategorie/${category.urlSlug}`}>{category.name}</a>
				{/each}
			</div>
		</nav>
		<button type="button" class="fixed lg:hidden hidden inset-0 z-10 h-full w-full cursor-default bg-secondary/75 backdrop-blur-sm" tabindex="-1" on:click={toggleMenu} id="closeMenu"></button>
	</div>
</header>
<div class="absolute w-full h-24 bg-primary">

</div>
