<script lang="ts">
	import { Chart, Tooltip, type ChartData, type ChartOptions } from 'chart.js';
	import type { HTMLCanvasAttributes } from 'svelte/elements';
	import 'chartjs-adapter-luxon'; // Import the Luxon adapter
	import 'chart.js/auto';
	import { DateTime } from 'luxon';
	import type { CompanyInfo } from '../interfaces/CompanyInfo';
	import StaticPicture from './picture/StaticPicture.svelte';
	import { onDestroy } from 'svelte';

	interface Props extends HTMLCanvasAttributes {
		stockTicker: string;
	}

	const { stockTicker }: Props = $props();

	let currentValue = $state(0);
	let percentage = $state(0);

	let companyInfo = $state<CompanyInfo>();

	let multiplier = $state(5);
	let timespan = $state<'day' | 'week' | 'month' | 'year' | 'minute' | 'hour'>('minute');
	let from: string = DateTime.now().minus({ days: 1 }).toISODate();
	let xAxeUnit = $state<
		| false
		| 'millisecond'
		| 'second'
		| 'minute'
		| 'hour'
		| 'day'
		| 'week'
		| 'month'
		| 'quarter'
		| 'year'
		| undefined
	>('hour');

	let timespanText = $state('24h');

	function updateScaleXTime(unit: string) {
		if (options.scales && options.scales.x && (options.scales.x as any).time) {
			(options.scales.x as any).time = { unit: unit };
		}
	}

	async function getCurrentValue() {
		try {
			const url = new URL(`/api/stockNameDate`, window.location.origin);
			url.searchParams.set(`tickerSymbol`, stockTicker.toUpperCase());
			url.searchParams.set(`multiplier`, multiplier.toString());
			url.searchParams.set(`timespan`, timespan);
			url.searchParams.set(`from`, from);

			const res = await fetch(url.toString());

			if (!res.ok) {
				throw new Error(`API error: ${res.status}`);
			}

			const stockData = await res.json();
			if (stockData.length > 0) {
				currentValue = stockData[stockData.length - 1].y;
				percentage = ((currentValue - stockData[0].y) / stockData[0].y) * 100;
			}
		} catch (error) {
			console.error('Error fetching stock data:', error);
		}
	}

	async function getTickerInfo(): Promise<any> {
		try {
			const url = new URL(`/api/tickerInfo`, window.location.origin);
			url.searchParams.set(`tickerSymbol`, stockTicker.toUpperCase());

			const res = await fetch(url.toString());

			if (!res.ok) {
				throw new Error(`API error: ${res.status}`);
			}

			const stockInfo = await res.json();
			return stockInfo;
		} catch (error) {
			console.error('Error fetching stock data:', error);
		}
	}

	const fetchStockData = async () => {
		companyInfo = await getTickerInfo();
		await getCurrentValue();
		try {
			const url = new URL(`/api/stockNameDate`, window.location.origin);
			url.searchParams.set(`tickerSymbol`, stockTicker.toUpperCase());
			url.searchParams.set(`multiplier`, multiplier.toString());
			url.searchParams.set(`timespan`, timespan);
			url.searchParams.set(`from`, from);

			const res = await fetch(url.toString());

			if (!res.ok) {
				throw new Error(`API error: ${res.status}`);
			}

			return await res.json();
		} catch (error) {
			console.error('Error fetching stock data:', error);
			return [];
		}
	};

	let data: ChartData<'line', number[], string> = {
		labels: [],
		datasets: [
			{
				label: stockTicker,
				backgroundColor: 'rgba(30, 41, 123, 0.5)',
				borderColor: 'rgb(30, 41, 59)',
				data: [],
				tension: 0.3,
				fill: true,
				pointRadius: 0
			}
		]
	};

	const updateChartData = async () => {
		const stockData = await fetchStockData();
		console.log(stockData);
		if (stockData.length > 0) {
			data.labels = stockData.map((item: { x: string }) => item.x);
			data.datasets[0].data = stockData.map((item: { y: number }) => item.y);
		} else {
			data.labels = [];
			data.datasets[0].data = [];
		}
		if (chart) {
			chart.update();
		}
	};

	let options: ChartOptions<'line'> = {
		responsive: true,
		maintainAspectRatio: false,
		interaction: {
			intersect: false
		},
		scales: {
			x: {
				type: 'time',
				time: {
					unit: xAxeUnit
				},
				ticks: {
					color: 'black'
				}
			},
			y: {
				ticks: {
					color: 'black'
				}
			}
		},
		plugins: {
			legend: {
				labels: {
					color: 'black'
				},
				title: {
					display: false
				},
				display: false
			}
		}
	};

	$effect(() => {
		updateChartData();
	});

	Chart.register(Tooltip);

	let canvasElem: HTMLCanvasElement;
	let chart: Chart;

	$effect(() => {
		chart = new Chart(canvasElem, {
			type: 'line',
			data,
			options
		});

		return () => {
			chart.destroy();
		};
	});

	$effect(() => {
		if (chart) {
			chart.data = data;
			chart.update();
		}
	});

	onDestroy(() => {
		if (chart) {
			chart.destroy();
		}
	});
</script>

<div class="flex flex-col bg-white p-4 pt-6 shadow-md lg:flex-row">
	<div>
		{#if companyInfo}
			<div class="mr-4 flex h-full justify-between lg:max-w-[300px] lg:flex-col">
				<div class="flex flex-col gap-2">
					<StaticPicture
						image={companyInfo.logo}
						width={200}
						height={0}
						alt={companyInfo.name}
						class="object-contain max-md:w-32 max-sm:w-20"
					/>
					<div class="text-2xs font-medium text-gray-800 max-sm:hidden md:text-md">
						{companyInfo.name}
						<span class="text-3xs text-gray-500 md:text-sm">({companyInfo.ticker})</span>
					</div>
					<div>
						<span class="text-xs font-semibold sm:hidden">{companyInfo.ticker}</span>
					</div>
					<div class="text-3xs text-gray-600 md:text-2xs">
						<span class="text-3xs font-semibold md:text-2xs">Tržní kapitalizace:</span>
						{#if companyInfo.market_cap}
							{#if +companyInfo.market_cap >= 1_000_000_000}
								{(+companyInfo.market_cap / 1_000_000_000).toFixed(2)}$ miliardy
							{:else if +companyInfo.market_cap >= 1_000_000}
								{(+companyInfo.market_cap / 1_000_000).toFixed(2)}$ miliony
							{:else if +companyInfo.market_cap >= 1_000}
								{(+companyInfo.market_cap / 1_000).toFixed(2)}$ tisíce
							{:else}
								{+companyInfo.market_cap}$
							{/if}
						{:else}
							-
						{/if}
					</div>
					<div class="text-3xs text-gray-600 md:text-2xs">
						<span class="text-2xs font-semibold">Na burze od:</span>
						{DateTime.fromISO(companyInfo.list_date).toLocaleString(DateTime.DATE_MED)}
					</div>
				</div>
				<div
					class="-mt-2 flex h-full flex-col items-end lg:m-0 lg:h-auto lg:flex-row lg:items-center lg:gap-2"
				>
					<div class="text-md font-medium text-gray-900 md:text-3xl">
						{currentValue ? currentValue.toFixed(2) : '-'}&nbsp;USD
					</div>
					<div class="flex items-center text-3xs md:text-sm">
						<div class="flex items-center">
							<span
								class="mr-1"
								class:text-green-600={percentage >= 0}
								class:text-red-600={percentage < 0}
							>
								{percentage ? percentage.toFixed(2) : '-'}%
							</span>
							<span class="text-4xs text-gray-500">({timespanText})</span>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
	<div class="w-full lg:max-w-[calc(100%-300px)]">
		<div class="flex flex-col justify-end md:flex-row lg:items-end">
			<div>
				<div class="mt-4 flex justify-center space-x-4 text-3xs text-gray-500">
					<button
						onclick={() => {
							timespan = 'minute';
							from = DateTime.now().minus({ days: 1 }).toISODate();
							multiplier = 5;
							xAxeUnit = 'hour';
							timespanText = '24h';
							updateScaleXTime(xAxeUnit);
							updateChartData();
						}}
						class="hover:text-blue-500 focus:outline-none"
					>
						1&nbsp;D
					</button>
					<button
						onclick={() => {
							timespan = 'minute';
							from = DateTime.now().minus({ days: 5 }).toISODate();
							multiplier = 5;
							xAxeUnit = 'day';
							timespanText = '5d';
							updateScaleXTime(xAxeUnit);
							updateChartData();
						}}
						class="hover:text-blue-500 focus:outline-none"
					>
						5&nbsp;D
					</button>
					<button
						onclick={() => {
							timespan = 'day';
							from = DateTime.now().minus({ months: 1 }).toISODate();
							multiplier = 1;
							xAxeUnit = 'day';
							timespanText = '1m';
							updateScaleXTime(xAxeUnit);
							updateChartData();
						}}
						class="hover:text-blue-500 focus:outline-none"
					>
						1&nbsp;M
					</button>
					<button
						onclick={() => {
							timespan = 'day';
							from = DateTime.now().minus({ months: 6 }).toISODate();
							multiplier = 1;
							xAxeUnit = 'week';
							timespanText = '6m';
							updateScaleXTime(xAxeUnit);
							updateChartData();
						}}
						class="hover:text-blue-500 focus:outline-none"
					>
						6&nbsp;M
					</button>
					<button
						onclick={() => {
							timespan = 'day';
							from = DateTime.now().startOf('year').toISODate();
							5;
							multiplier = 1;
							xAxeUnit = 'week';
							timespanText = '1y';
							updateScaleXTime(xAxeUnit);
							updateChartData();
						}}
						class="hover:text-blue-500 focus:outline-none"
					>
						YTD
					</button>
					<button
						onclick={() => {
							timespan = 'day';
							from = DateTime.now().minus({ months: 12 }).toISODate();
							5;
							multiplier = 1;
							xAxeUnit = 'week';
							timespanText = '1y';
							updateScaleXTime(xAxeUnit);
							updateChartData();
						}}
						class="hover:text-blue-500 focus:outline-none"
					>
						1&nbsp;R
					</button>
					<button
						onclick={() => {
							timespan = 'day';
							from = DateTime.now().minus({ years: 10 }).toISODate();
							50;
							multiplier = 1;
							xAxeUnit = 'quarter';
							timespanText = '10y';
							updateScaleXTime(xAxeUnit);
							updateChartData();
						}}
						class="hover:text-blue-500 focus:outline-none"
					>
						10&nbsp;R
					</button>
				</div>
			</div>
		</div>
		<canvas bind:this={canvasElem} class="h-40 max-h-40 w-full lg:h-52 lg:max-h-52"></canvas>
	</div>
</div>
