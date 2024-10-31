import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const postcssConfig = join(__dirname, 'postcss.config.js'); // https://stackoverflow.com/a/77137441

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		vitePreprocess(),
		sveltePreprocess({
			postcss: {
				configFilePath: postcssConfig
			}
		})
	],
	kit: {
		adapter: adapter({
			out: '.build'
		}),
		appDir: 'src',
	},
	onwarn: (warning, handler) => {
		const { code } = warning;
		if (code === 'css-unused-selector') {
			return;
		}

		handler?.(warning);
	}
};

export default config;
