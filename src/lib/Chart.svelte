<script lang="ts">
  import {
    Chart,
    LineController,
    LinearScale,
    CategoryScale,
    PointElement,
    LineElement,
    Legend,
    Tooltip,
    LogarithmicScale
  } from "chart.js";
  import type { ChartConfiguration } from "chart.js";

  import { onMount, onDestroy } from "svelte";

  let canvas;
  let chartInstance;
  export let config: ChartConfiguration;
  export let width = undefined;
  export let height = undefined;

  $: if (chartInstance) {
    chartInstance.data = config.data;
    chartInstance.options = config.options;
    chartInstance.update();
  }

  onMount(async () => {
    Chart.register(
      LineController,
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      Legend,
      Tooltip,
      LogarithmicScale
    );
    chartInstance = new Chart(canvas, config);
  });

  onDestroy(() => {
    chartInstance?.destroy();
  });
</script>

<canvas bind:this={canvas} {width} {height} />
