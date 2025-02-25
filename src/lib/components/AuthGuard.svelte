<script lang="ts">
	import { onMount } from 'svelte';

	onMount(async () => {
		const token = localStorage.getItem('token');
		if (token) {
			const response = await fetch('/auth/verify', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ token }),
			});

			const data = await response.json();

			if (!response.ok && !data.valid) {
				console.error('Failed to verify token');
				localStorage.removeItem('token');
				window.location.href = '/login';
			}
		} else {
			window.location.href = '/login';
		}
	});
</script>

<slot />
