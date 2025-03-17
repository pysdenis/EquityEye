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

	let multiplier = 15;
	let timespan: 'day' | 'week' | 'month' | 'year' | 'minute' | 'hour' = 'minute';
	let from: string = DateTime.now().minus({ days: 5 }).toISODate();

	const fetchStockData = async () => {
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
				fill: true
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
				}
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
	<canvas bind:this={canvasElem} class="h-64 max-h-64 w-full"></canvas>
	<div class="mt-4 flex justify-center space-x-4 text-gray-500">
		<button
			on:click={() => {
				timespan = 'day';
				from = DateTime.now().minus({ days: 1 }).toISODate();
				updateChartData();
			}}
			class="hover:text-blue-500 focus:outline-none"
		>
			1 D
		</button>
		<button
			on:click={() => {
				timespan = 'week';
				from = DateTime.now().minus({ days: 5 }).toISODate();
				updateChartData();
			}}
			class="hover:text-blue-500 focus:outline-none"
		>
			5 D
		</button>
		<button
			on:click={() => {
				timespan = 'month';
				from = DateTime.now().minus({ months: 1 }).toISODate();
				updateChartData();
			}}
			class="hover:text-blue-500 focus:outline-none"
		>
			1 M
		</button>
		<button
			on:click={() => {
				timespan = 'month';
				from = DateTime.now().minus({ months: 6 }).toISODate();
				updateChartData();
			}}
			class="hover:text-blue-500 focus:outline-none"
		>
			6 M
		</button>
		<button
			on:click={() => {
				timespan = 'year';
				from = DateTime.now().startOf('year').toISODate();
				updateChartData();
			}}
			class="hover:text-blue-500 focus:outline-none"
		>
			YTD
		</button>
		<button
			on:click={() => {
				timespan = 'year';
				from = DateTime.now().minus({ years: 1 }).toISODate();
				updateChartData();
			}}
			class="hover:text-blue-500 focus:outline-none"
		>
			1 R
		</button>
		<button
			on:click={() => {
				timespan = 'year';
				from = DateTime.now().minus({ years: 5 }).toISODate();
				updateChartData();
			}}
			class="hover:text-blue-500 focus:outline-none"
		>
			5 R
		</button>
		<button
			on:click={() => {
				timespan = 'year';
				from = DateTime.now().minus({ years: 10 }).toISODate();
				updateChartData();
			}}
			class="hover:text-blue-500 focus:outline-none"
		>
			Max.
		</button>
	</div>
</div>
