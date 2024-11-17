<script lang="ts">
	import { writable } from 'svelte/store';
	import type { Chart } from 'chart.js/auto';
	import { fetchPortfolioHistory } from '$lib/api';
	import { onMount } from 'svelte';

	export const chartData = writable<{ labels: string[]; values: number[] }>({
		labels: [],
		values: [],
	});

	let selectedFilter = '1M'; // Defaultní filtr

	// Možnosti filtru
	const filters = [
		{ label: '1M', value: '1M' },
		{ label: '3M', value: '3M' },
		{ label: '6M', value: '6M' },
		{ label: '1Y', value: '1Y' },
		{ label: 'All', value: 'ALL' },
	];

	// Funkce pro aktualizaci dat
	async function updateChart(filter: string) {
		const data = await fetchPortfolioHistory("12345", filter); // DELETE 12345 after implementing the API
		chartData.set(data);
	}

	onMount(() => {
		updateChart(selectedFilter);
	});

	// Action pro inicializaci a aktualizaci grafu
	export function chart(node: HTMLCanvasElement, data: { labels: string[]; values: number[] }) {
		let chart: Chart;

		async function initializeChart(labels: string[], values: number[]) {
			const { Chart } = await import('chart.js');

			chart = new Chart(node, {
				type: 'line',
				data: {
					labels: labels,
					datasets: [
						{
							label: 'Portfolio Value',
							data: values,
							borderColor: 'rgb(75, 192, 192)',
							backgroundColor: 'rgba(75, 192, 192, 0.2)',
							tension: 0.1,
						},
					],
				},
				options: {
					responsive: true,
					scales: {
						x: { title: { display: true, text: 'Time' } },
						y: { title: { display: true, text: 'Value (in USD)' } },
					},
				},
			});
		}

		// Vytvoření nebo aktualizace grafu
		const unsubscribe = chartData.subscribe((data) => {
			if (chart) {
				chart.destroy();
			}
			initializeChart(data.labels, data.values);
		});

		return {
			destroy() {
				if (chart) chart.destroy();
				unsubscribe();
			},
		};
	}
</script>

<!-- Filtrační tlačítka -->
<div class="filter-buttons">
	{#each filters as filter}
		<button
			on:click={() => {
				selectedFilter = filter.value;
				updateChart(filter.value);
			}}
			class:selected={selectedFilter === filter.value}
		>
			{filter.label}
		</button>
	{/each}
</div>

<!-- Canvas pro Chart.js -->
<canvas use:chart={$chartData}></canvas>
