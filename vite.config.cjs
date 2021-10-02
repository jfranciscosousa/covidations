const pkg = require("./package.json");

/** @type {import('vite').UserConfig} */
export default {
  optimizeDeps: { include: ["chart.js", "cross-fetch"] }
};
