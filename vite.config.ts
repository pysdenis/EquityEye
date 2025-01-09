import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { imagetools } from 'vite-imagetools';

export default defineConfig(() => {
	return {
		plugins: [
			imagetools({
				defaultDirectives: (url) => {
					const searchParams = new URLSearchParams(url.searchParams);
					if (searchParams.has('webp')) {
						searchParams.append('format', 'webp');
					}
					return searchParams;
				}
			}),
			sveltekit()
		]
	};
});
