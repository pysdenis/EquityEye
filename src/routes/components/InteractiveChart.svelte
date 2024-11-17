<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, type ChartConfiguration } from 'chart.js/auto';

	let chart: Chart;

	onMount(() => {
		const ctx = document.getElementById('myChart') as HTMLCanvasElement;
		const config: ChartConfiguration = {
			type: 'line' as const,
			data: {
				labels: ['January', 'February', 'March'],
				datasets: [
					{
						label: 'Portfolio Value',
						data: [1000, 1200, 1500],
						borderColor: 'rgb(75, 192, 192)',
						tension: 0.1,
					},
				],
			},
		};
		chart = new Chart(ctx, config);

		return () => {
			chart.destroy();
		};
	});
</script>

<div>
	<canvas id="myChart"></canvas>
</div>
