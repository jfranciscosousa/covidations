const sveltePreprocess = require("svelte-preprocess");
const buildAdapter = require("@sveltejs/adapter-vercel");
const pkg = require("./package.json");

/** @type {import('@sveltejs/kit').Config} */
module.exports = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		sveltePreprocess({
			defaults: {
				style: "postcss"
			},
			postcss: true
		})
	],
	kit: {
		adapter: buildAdapter(),

		// hydrate the <div id="svelte"> element in src/app.html
		target: "#svelte",

		vite: {
			ssr: {
				// Remove any non-ES package from Vite optimizations
				noExternal: Object.keys(pkg.dependencies || {})
			}
		}
	}
};
