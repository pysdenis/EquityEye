import autoprefixer from 'autoprefixer';
import postcssImport from 'postcss-import';
import tailwindcss from 'tailwindcss';
import tailwindcssNesting from 'tailwindcss/nesting/index.js';

/** @type {import('postcss-load-config').Config} */
export default {
	plugins: [postcssImport, tailwindcssNesting(), tailwindcss, autoprefixer]
};
