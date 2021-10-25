import sveltePreprocess from "svelte-preprocess";
import buildAdapter from "@sveltejs/adapter-vercel";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    sveltePreprocess({
      postcss: true
    })
  ],
  kit: {
    adapter: buildAdapter(),
    target: "#svelte",
    vite: {
      optimizeDeps: { include: ["chart.js", "cross-fetch"] }
    }
  }
};

export default config;
