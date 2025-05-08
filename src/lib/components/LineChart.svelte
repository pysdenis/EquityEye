<script lang="ts">
	import { Chart, Tooltip, type ChartData, type ChartOptions } from 'chart.js';
	import type { HTMLCanvasAttributes } from 'svelte/elements';
	import 'chartjs-adapter-luxon';
	import 'chart.js/auto';
	import { DateTime } from 'luxon';
	import type { CompanyInfo } from '../interfaces/CompanyInfo';
	import StaticPicture from './picture/StaticPicture.svelte';
	import plus from '../assets/icons/cross.svg?raw';
	import Icon from './Icon.svelte';

	interface Props extends HTMLCanvasAttributes {
		stockTicker: string;
		defaultStyle: boolean | undefined;
		handleAddStock: (ticker: string | undefined) => void;
	}

	const { stockTicker, handleAddStock, defaultStyle }: Props = $props();

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
			if (!res.ok) throw new Error(`API error: ${res.status}`);

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
			if (!res.ok) throw new Error(`API error: ${res.status}`);

			return await res.json();
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
			if (!res.ok) throw new Error(`API error: ${res.status}`);

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
				backgroundColor: 'rgba(30, 41, 123, 0.7)',
				borderColor: 'rgba(30, 41, 59, 0.9)',
				data: [],
				tension: 0.3,
				fill: true,
				pointRadius: 0
			}
		]
	};

	const updateChartData = async () => {
		const stockData = await fetchStockData();
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
	let chart: Chart | null;

	// Vytvoření grafu + cleanup při unmountu
	$effect(() => {
		if (!canvasElem) return;

		chart = new Chart(canvasElem, {
			type: 'line',
			data,
			options
		});

		return () => {
			chart?.destroy();
			chart = null;
		};
	});

	// Reakce na změnu data => aktualizace grafu
	$effect(() => {
		if (chart) {
			chart.data = data;
			chart.update();
		}
	});
</script>

<div
	class="flex flex-col bg-white {!defaultStyle
		? 'p-4 pt-6 shadow-md'
		: 'p-2'} lg:flex-row lg:justify-between"
>
	<div>
		{#if companyInfo}
			<div class="mr-4 flex h-full justify-between lg:max-w-[300px] lg:flex-col">
				<div class="flex flex-col gap-2">
					{#if companyInfo.logo.length > 0}
						<StaticPicture
							image={companyInfo.logo}
							width="auto"
							height={30}
							alt={companyInfo.name}
							class="flex justify-start max-md:h-[1.175rem] max-sm:h-[1rem] md:h-[1.875rem]"
							imgClass="object-contain max-md:h-[1.175rem] max-sm:h-[1rem] md:h-[1.875rem] md:max-w-[8.25rem] max-sm:max-w-[6.25rem]"
						/>
					{/if}
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
				<div class="flex h-full flex-col-reverse max-lg:gap-2 lg:h-auto lg:flex-col">
					{#if !defaultStyle}
						<button
							class="flex items-center gap-1 rounded-lg text-3xs font-light text-green-600 transition-all duration-300 hover:text-green-700 focus:outline-none max-lg:flex-row-reverse"
							onclick={() => handleAddStock(companyInfo?.ticker)}
						>
							<Icon
								icon={plus}
								class="h-4 w-4 rotate-45 text-green-600 transition-all duration-300 hover:text-green-700"
							/>
							<span class="mt-[1px]">Přidat</span>
						</button>
					{/if}
					<div class="-mt-2 flex flex-col items-end lg:m-0 lg:flex-row lg:items-center lg:gap-2">
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
						class:text-blue-500={timespan === 'minute' && timespanText === '24h'}
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
						class:text-blue-500={timespan === 'minute' && timespanText === '5d'}
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
						class:text-blue-500={timespan === 'day' && timespanText === '1m'}
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
						class:text-blue-500={timespan === 'day' && timespanText === '6m'}
					>
						6&nbsp;M
					</button>
					<button
						onclick={() => {
							timespan = 'day';
							from = DateTime.now().startOf('year').toISODate();
							multiplier = 1;
							xAxeUnit = 'week';
							timespanText = '1y';
							updateScaleXTime(xAxeUnit);
							updateChartData();
						}}
						class="hover:text-blue-500 focus:outline-none"
						class:text-blue-500={timespan === 'day' &&
							timespanText === '1y' &&
							from === DateTime.now().startOf('year').toISODate()}
					>
						YTD
					</button>
					<button
						onclick={() => {
							timespan = 'day';
							from = DateTime.now().minus({ months: 12 }).toISODate();
							multiplier = 1;
							xAxeUnit = 'week';
							timespanText = '1y';
							updateScaleXTime(xAxeUnit);
							updateChartData();
						}}
						class="hover:text-blue-500 focus:outline-none"
						class:text-blue-500={timespan === 'day' &&
							timespanText === '1y' &&
							from === DateTime.now().minus({ months: 12 }).toISODate()}
					>
						1&nbsp;R
					</button>
					<button
						onclick={() => {
							timespan = 'day';
							from = DateTime.now().minus({ years: 10 }).toISODate();
							multiplier = 1;
							xAxeUnit = 'quarter';
							timespanText = '10y';
							updateScaleXTime(xAxeUnit);
							updateChartData();
						}}
						class="hover:text-blue-500 focus:outline-none"
						class:text-blue-500={timespan === 'day' && timespanText === '10y'}
					>
						10&nbsp;R
					</button>
				</div>
			</div>
		</div>
		<canvas bind:this={canvasElem} class="h-40 max-h-40 w-full lg:h-52 lg:max-h-52"></canvas>
	</div>
</div>
