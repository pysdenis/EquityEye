<script lang="ts">
	import AuthGuard from '../../lib/components/AuthGuard.svelte';
	import '$lib/assets/css/main.css';
	import logoutIcon from '$lib/assets/icons/logout.svg?raw';
	import person from '$lib/assets/icons/person.svg?raw';
	import dashboard from '$lib/assets/icons/dashboard.svg?raw';
	import Icon from '../../lib/components/Icon.svelte';

	const logout = async () => {
		localStorage.removeItem('token');3
		window.location.href = '/login';
	};
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<AuthGuard>
	<div class="flex w-[100dvw] min-h-[100dvh] bg-gray-200">
		<div class="w-1/6 bg-slate-800 h-[100dvh] p-3 flex fixed top-0 left-0 flex-col justify-between">
			<div>
				<div class="flex justify-center md:justify-start gap-3 items-center">
					<a href="/">
						<!-- <StaticPicture image={logo} height={40} width={40} alt="Logo THE CAP" imgClass="h-10" /> -->
						 LOGO TODO
					</a>
				</div>
				<nav class="flex flex-col gap-2 mt-7">
					<a href="/admin" class="p-2 items-center hover:bg-gray-200 lg:justify-start justify-center flex bg-gray-700 transition-all duration-300 text-white hover:text-text rounded-md text-center">
						<Icon icon={dashboard} class="w-5 h-5" />
						<span class="hidden lg:inline-block ml-3">Přehled</span>
					</a>
					<a href="/akcie" class="items-center p-2 hover:bg-gray-200 lg:justify-start justify-center flex bg-gray-700 transition-all duration-300 text-white hover:text-text rounded-md text-center">
						<!-- <Icon icon={authors} class="w-5 h-5" /> -->
						<span class="hidden lg:inline-block ml-3">Akcie</span>
					</a>
					<a href="/admin/categories" class="items-center p-2 hover:bg-gray-200 lg:justify-start justify-center flex bg-gray-700 transition-all duration-300 text-white hover:text-text rounded-md text-center">
						<!-- <Icon icon={categories} class="w-5 h-5" /> -->
						<span class="hidden lg:inline-block ml-3">Portfolio</span>
					</a>
					<a href="/novinky" class="items-center p-2 hover:bg-gray-200 lg:justify-start justify-center flex bg-gray-700 transition-all duration-300 text-white hover:text-text rounded-md text-center">
						<!-- <Icon icon={articles} class="w-5 h-5" /> -->
						<span class="hidden lg:inline-block ml-3">Novinky</span>
					</a>
				</nav>
			</div>
			<div class="flex md:flex-row flex-col-reverse gap-2 md:justify-between items-center mt-6">
				<button class="p-2 hover:bg-white uppercase duration-300 group transition-all text-2xs text-white rounded-md" on:click={logout}>
					<Icon icon={logoutIcon} class="w-5 h-5 text-white group-hover:text-red-800 transition-colors" />
				</button>
				<a class="p-2 hover:bg-white uppercase duration-300 group transition-all text-2xs text-white rounded-md" href="/nastaveni">
					<Icon icon={person} class="w-5 h-5 text-white group-hover:text-black transition-colors" />
				</a>
			</div>
		</div>
		<main class="flex-1 h-full ml-[16.6667%] py-2 px-2 flex flex-col pb-5 max-md:overflow-y-auto relative md:px-8">
				<slot />
		</main>
	</div>
</AuthGuard>
