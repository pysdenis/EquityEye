<script lang="ts">
	import AuthGuard from '../../lib/components/AuthGuard.svelte';
	import '$lib/assets/css/main.css';
	import logoutIcon from '$lib/assets/icons/logout.svg?raw';
	import person from '$lib/assets/icons/person.svg?raw';
	import dashboard from '$lib/assets/icons/dashboard.svg?raw';
	import graph from '$lib/assets/icons/graph.svg?raw';
	import portfolio from '$lib/assets/icons/portfolio.svg?raw';
	import news from '$lib/assets/icons/news.svg?raw';
	import Icon from '../../lib/components/Icon.svelte';
	import StaticPicture from '../../lib/components/picture/StaticPicture.svelte';
	import logo from '$lib/assets/logo.png';
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';
	import { refreshUnreadCount, unreadCount } from '../../lib/scripts/notifications';

	const logout = async () => {
		localStorage.removeItem('token');
		3;
		window.location.href = '/login';
	};

	onMount(async () => {
		refreshUnreadCount();
	});
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<AuthGuard>
	<div class="flex min-h-[100dvh] w-[100dvw] bg-gray-200">
		<div class="fixed left-0 top-0 flex h-[100dvh] w-1/6 flex-col justify-between bg-slate-800 p-3">
			<div>
				<div class="flex items-center justify-center gap-3 lg:justify-start">
					<a href="/" class="flex items-center gap-2 xl:gap-4">
						<StaticPicture
							image={logo}
							height={80}
							width={80}
							alt="Logo EquityEye"
							imgClass="h-10 md:h-12 object-contain w-fit"
						/>
						<span
							class="mt-1.5 text-md font-semibold tracking-wider text-white max-lg:hidden xl:text-lg"
							>EquityEye</span
						>
					</a>
				</div>
				<nav class="mt-7 flex flex-col gap-2">
					<a
						href="/"
						class="flex items-center justify-center rounded-md bg-gray-700 p-2 text-center text-white transition-all duration-300 hover:bg-gray-200 hover:text-text lg:justify-start"
					>
						<Icon icon={dashboard} class="h-5 w-5" />
						<span class="ml-3 hidden lg:inline-block">Přehled</span>
					</a>
					<a
						href="/portfolio"
						class="flex items-center justify-center rounded-md bg-gray-700 p-2 text-center text-white transition-all duration-300 hover:bg-gray-200 hover:text-text lg:justify-start"
					>
						<Icon icon={portfolio} class="h-5 w-5" />
						<span class="ml-3 hidden lg:inline-block">Portfolio</span>
					</a>
					<a
						href="/akcie"
						class="flex items-center justify-center rounded-md bg-gray-700 p-2 text-center text-white transition-all duration-300 hover:bg-gray-200 hover:text-text lg:justify-start"
					>
						<Icon icon={graph} class="h-5 w-5" />
						<span class="ml-3 hidden lg:inline-block">Akcie</span>
					</a>
					<a
						href="/novinky"
						class="flex items-center justify-center rounded-md bg-gray-700 p-2 text-center text-white transition-all duration-300 hover:bg-gray-200 hover:text-text lg:justify-start"
					>
						<Icon icon={news} class="h-5 w-5" />
						<span class="ml-3 hidden lg:inline-block">Novinky</span>
					</a>
				</nav>
			</div>
			<div class="mt-6 flex flex-col-reverse items-center gap-2 md:flex-row md:justify-between">
				<button
					class="group rounded-md p-2 text-2xs uppercase text-white transition-all duration-300 hover:bg-white"
					on:click={logout}
				>
					<Icon
						icon={logoutIcon}
						class="h-5 w-5 text-white transition-colors group-hover:text-red-800"
					/>
				</button>
				<a
					class="group relative rounded-md p-2 text-2xs uppercase text-white transition-all duration-300 hover:bg-white"
					href="/nastaveni"
				>
					<Icon icon={person} class="h-5 w-5 text-white transition-colors group-hover:text-black" />
					{#if $unreadCount > 0}
						<span
							class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white"
						>
							{$unreadCount}
						</span>
					{/if}
				</a>
			</div>
		</div>
		<main
			class="relative ml-[16.6667%] flex h-full flex-1 flex-col px-2 py-2 pb-5 pt-10 max-md:overflow-y-auto md:px-8"
		>
			<slot />
		</main>
	</div>
</AuthGuard>
