<script lang="ts">
	import { onMount } from 'svelte';

	export const containerClass = '';

	let dots: NodeListOf<HTMLElement>;

	let animationCount = 0;
	const maxAnimations = 10;

	function animateDots() {
		if (animationCount >= maxAnimations) return;
		dots.forEach((dot, index) => {
			setTimeout(() => {
				dot.style.opacity = '1';
				setTimeout(() => {
					dot.style.opacity = '0';
					if (index === dots.length - 1) {
						animationCount++;
						animateDots();
					}
				}, 500);
			}, 200 * index);
		});
	}

	onMount(() => {
		dots = document.querySelectorAll('.dot') as NodeListOf<HTMLElement>;
		animateDots();
	});
</script>

<div class="flex justify-center flex-col items-center mt-16 h-full">
	<p class="text-2xl">
		Načítání<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
	</p>
	<div class="w-40 h-40">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150"><path fill="none" stroke="#000000" stroke-width="15" stroke-linecap="round" stroke-dasharray="300 385" stroke-dashoffset="0" d="M275 75c0 31-27 50-50 50-58 0-92-100-150-100-28 0-50 22-50 50s23 50 50 50c58 0 92-100 150-100 24 0 50 19 50 50Z"><animate attributeName="stroke-dashoffset" calcMode="spline" dur="2" values="685;-685" keySplines="0 0 1 1" repeatCount="indefinite"></animate></path></svg>
	</div>
</div>

