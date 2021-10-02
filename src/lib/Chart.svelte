<script lang="ts">
  import type { Chart, ChartConfiguration } from "chart.js";

  import { onMount, onDestroy } from "svelte";

  let canvas: HTMLCanvasElement;
  let chartInstance: Chart;
  export let config: ChartConfiguration;
  export let width = undefined;
  export let height = undefined;

  $: if (chartInstance) {
    chartInstance.data = config.data;
    chartInstance.options = config.options;
    chartInstance.update();
  }

  onMount(async () => {
    const {
      Chart,
      LineController,
      LinearScale,
      CategoryScale,
      PointElement,
      LineElement,
      Legend,
      Tooltip
    } = await import("chart.js");

    Chart.register(
      LineController,
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      Legend,
      Tooltip
    );
    chartInstance = new Chart(canvas, config);
  });

  onDestroy(() => {
    chartInstance?.destroy();
  });
</script>

<canvas bind:this={canvas} {width} {height} />
