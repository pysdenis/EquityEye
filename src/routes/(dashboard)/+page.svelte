<script lang="ts">
	import { onMount } from 'svelte';
	import Loading from '../../lib/components/Loading.svelte';
	import LineChart from '../../lib/components/LineChart.svelte';
	import { popularTickets } from '../../lib/consts/popularTickets';
	import type { IUser } from '../../lib/models/User';

	let userData: IUser | null = null;

	onMount(async () => {
		loadPortfolio();
		const token = localStorage.getItem('token');
		try {
			const response = await fetch('/api/dashboard', {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			if (response.ok) {
				userData = await response.json();
			} else {
				console.error('Failed to fetch user data');
			}
		} catch (error) {
			console.error('Error fetching user data:', error);
		}
	});

	let usersStocks: string[] = [];

	async function loadPortfolio() {
		let portfolio;
		try {
			const url = new URL('/api/portfolio/get', window.location.origin);
			url.searchParams.set('userId', localStorage.getItem('id')!);
			const res = await fetch(url.toString());
			if (!res.ok) throw new Error('Chyba při načítání portfolia');
			portfolio = await res.json();

			if (portfolio && portfolio.stocks) {
				// 1) Připravíme nové pole
				let newArray: string[] = [];
				for (const stock of portfolio.stocks) {
					if (stock.amount > 0) {
						newArray.push(stock.ticker);
					}
				}
				// 2) Přiřadíme do usersStocks, aby se Svelte dozvědělo o změně
				usersStocks = newArray;
			}
		} catch (err) {
			console.error(err);
		}
	}

	const handleAddStock = (stock: string | undefined) => {
		window.location.href = `/akcie`;
	};
</script>

<main class="flex min-h-screen flex-col items-center justify-center">
	{#if userData}
		<div class="grid w-full max-w-[1200px] grid-cols-1 gap-4">
			<section class="flex flex-col gap-4 rounded">
				<div>
					<h2 class="text-lg font-semibold text-gray-700">Vítej, {userData.username}</h2>
					<p class="text-sm text-gray-600">Email: {userData.email}</p>
				</div>

				<!-- 3 akcie z portfolia -->
				{#if usersStocks && usersStocks.length > 0}
					<div class="mt-2">
						<div class="mb-2 flex w-full items-center justify-between">
							<span class="text-md font-medium text-gray-700">Náhled portfolia</span>
							<a
								href="/portfolio"
								class="inline-block text-sm text-blue-600 underline hover:text-blue-800"
								>Moje portfolio</a
							>
						</div>
						<div class="flex flex-col gap-2">
							{#each usersStocks.slice(0, 3) as asset}
								<div class="rounded bg-white p-2">
									<LineChart stockTicker={asset} defaultStyle {handleAddStock} />
								</div>
							{/each}
						</div>
					</div>
				{:else}
					<p class="mt-2 text-sm text-gray-500">Žádné akcie k zobrazení.</p>
					<a href="/akcie" class="inline-block text-sm text-blue-600 underline hover:text-blue-800"
						>Zde si je můžete přidat</a
					>
				{/if}
			</section>

			<section class="flex flex-col gap-4">
				<div>
					<div class="mb-2 flex w-full items-center justify-between">
						<span class="text-md font-medium text-gray-700">Populární akcie</span>
						<a
							href="/akcie"
							class="inline-block text-sm text-blue-600 underline hover:text-blue-800"
							>Další akcie</a
						>
					</div>
					<div class="mt-2 grid grid-cols-1 gap-2">
						{#each popularTickets.slice(0, 3) as ticker}
							<div class="rounded bg-white p-2">
								<LineChart stockTicker={ticker} defaultStyle {handleAddStock} />
							</div>
						{/each}
					</div>
				</div>
			</section>
		</div>
	{:else}
		<Loading />
	{/if}
</main>
