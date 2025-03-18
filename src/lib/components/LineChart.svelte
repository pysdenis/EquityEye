<script lang="ts">
	import { Chart, Tooltip, type ChartData, type ChartOptions } from 'chart.js';
	import type { HTMLCanvasAttributes } from 'svelte/elements';
	import 'chartjs-adapter-luxon'; // Import the Luxon adapter
	import 'chart.js/auto';
	import { DateTime } from 'luxon';

	interface Props extends HTMLCanvasAttributes {
		stockTicker: string;
	}

	const { stockTicker }: Props = $props();

	let currentValue = $state(0);
	let percentage = $state(0);

	let multiplier = $state(5);
	let timespan = $state<'day' | 'week' | 'month' | 'year' | 'minute' | 'hour'>('minute');
	let from: string = DateTime.now().minus({ days: 15 }).toISODate();

	let timespanText = $state('24h');

	let compare = 1;

	$effect(() => {
		switch (compare) {
			case 1:
				timespanText = "24h";
				break;
			case 5:
				timespanText = "5d";
				break;
			case 30:
				timespanText = "1m";
				break;
			case 180:
				timespanText = "6m";
				break;
			case 365:
				timespanText = "1y";
				break;
			case 3650:
				timespanText = "10y";
				break;
			default:
				compare = 1;
				timespanText = "24h";
		}
	});

	async function getCurrentValue() {
		try {
			const url = new URL(`/api/stockPrice?tickerSymbol=${stockTicker}`, window.location.origin);
			url.searchParams.set(`tickerSymbol`, stockTicker.toUpperCase());
			url.searchParams.set(`compare`, compare.toString());

			const res = await fetch(url.toString());

			if (!res.ok) {
				throw new Error(`API error: ${res.status}`);
			}

			const data = await res.json();
			currentValue = data.price;
			percentage = data.percentageChange;
		} catch (error) {
			console.error('Error fetching stock data:', error);
		}
	}

	const fetchStockData = async () => {
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
				pointRadius: 0,
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
					unit: 'day'
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
</script>

<div class="bg-white p-4 shadow-md">
	<div class="flex md:flex-row flex-col justify-between lg:items-end mb-4">
		<div>
			<div class="text-3xl font-medium text-gray-900">
				{currentValue ? currentValue.toFixed(2) : '-'} USD
			</div>
			<div class="flex items-center text-sm">
				<span class="mr-1" class:text-green-600={percentage >= 0} class:text-red-600={percentage < 0}>
					{percentage ? percentage.toFixed(2) : '-'} %
				</span>
				<span class="text-gray-500">({timespanText})</span>
			</div>
		</div>
		<div class="mt-4 flex justify-center space-x-4 text-gray-500">
			<button
				on:click={() => {
					timespan = 'minute';
					from = DateTime.now().minus({ days: 1 }).toISODate();
					compare = 1;
					updateChartData();
				}}
				class="hover:text-blue-500 focus:outline-none"
			>
				1 D
			</button>
			<button
				on:click={() => {
					timespan = 'minute';
					from = DateTime.now().minus({ days: 5 }).toISODate();
					compare = 5;
					updateChartData();
				}}
				class="hover:text-blue-500 focus:outline-none"
			>
				5 D
			</button>
			<button
				on:click={() => {
					timespan = 'day';
					from = DateTime.now().minus({ months: 1 }).toISODate();
					compare = 30;
					updateChartData();
				}}
				class="hover:text-blue-500 focus:outline-none"
			>
				1 M
			</button>
			<button
				on:click={() => {
					timespan = 'day';
					from = DateTime.now().minus({ months: 6 }).toISODate();
					compare = 180;
					updateChartData();
				}}
				class="hover:text-blue-500 focus:outline-none"
			>
				6 M
			</button>
			<button
				on:click={() => {
					timespan = 'day';
					from = DateTime.now().startOf('year').toISODate();
					compare = 365;
					updateChartData();
				}}
				class="hover:text-blue-500 focus:outline-none"
			>
				YTD
			</button>
			<button
				on:click={() => {
					timespan = 'week';
					from = DateTime.now().minus({ months: 12 }).toISODate();
					compare = 365;
					updateChartData();
				}}
				class="hover:text-blue-500 focus:outline-none"
			>
				1 R
			</button>
			<button
				on:click={() => {
					timespan = 'week';
					from = DateTime.now().minus({ years: 10 }).toISODate();
					compare = 3650;
					updateChartData();
				}}
				class="hover:text-blue-500 focus:outline-none"
			>
				10 R
			</button>
		</div>
	</div>
	<canvas bind:this={canvasElem} class="h-40 max-h-40 lg:h-52 lg:max-h-52 w-full"></canvas>
</div>
