import sveltePreprocess from "svelte-preprocess";
import buildAdapter from "@sveltejs/adapter-vercel";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [sveltePreprocess({})],
  kit: {
    adapter: buildAdapter(),

    target: "#svelte"
  }
};

export default config;
