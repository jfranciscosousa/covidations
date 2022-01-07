<script lang="ts" context="module">
  import type { Load } from "@sveltejs/kit";

  export const load: Load = async ({ fetch, url }) => {
    const date = url.searchParams.get("date");
    const apiUrl = date ? `/api/dailyCovidData.json?date=${date}` : "/api/dailyCovidData.json";
    const res: Response = (await fetch(apiUrl, { credentials: "omit" })) as never;
    let chartEndDate = format(new Date(), "yyyy-MM-dd");
    let chartStartDate = format(sub(new Date(), { days: 7 }), "yyyy-MM-dd");
    const chartRes: Response = (await fetch(
      `/api/historicalCovidData.json?start=${chartStartDate}&end=${chartEndDate}`,
      {
        credentials: "omit"
      }
    )) as never;

    if (res.ok) {
      const data = await res.json();
      const chartData = await chartRes.json();

      return {
        props: {
          dailyData: data,
          dailyDataLoading: false,
          chartStartDate,
          chartEndDate,
          chartData,
          chartDataLoading: false
        },
        maxage: 3600
      };
    }

    return {
      error: new Error("can't get covid data")
    };
  };
</script>

<script lang="ts">
  import { format, sub } from "date-fns";
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import StatCard from "$lib/StatCard.svelte";
  import LoadingSpinner from "$lib/LoadingSpinner.svelte";
  import Chart from "$lib/Chart.svelte";
  import type { DailyCovidData } from "$lib/types";
  import sleep from "$lib/sleep";

  export let dailyDataLoading: boolean;
  export let dailyData: DailyCovidData;
  export let chartStartDate: string;
  export let chartEndDate: string;
  export let chartDataLoading: boolean;
  export let chartData: any;

  function handleNavigation(url) {
    return async (event) => {
      event.preventDefault();

      // This code looks a bit convoluted
      // but it's to basically artificially delay
      // all requests by 500ms to give a nice
      // transition

      dailyDataLoading = true;
      await Promise.all([goto(url), sleep(500)]);
      dailyDataLoading = false;
    };
  }

  async function updateChart() {
    try {
      chartDataLoading = true;
      chartData = await (
        await fetch(
          `/api/historicalCovidData.json?start=${chartStartDate}&end=${chartEndDate}`
        )
      ).json();
    } catch (error) {
      // ignore error and keep original state
    } finally {
      chartDataLoading = false;
    }
  }

  let CHART_CONFIG: any;

  $: {
    CHART_CONFIG = {
      type: "line",
      options: {
        plugins: {
          legend: {
            display: true,
            labels: {
              color: "white"
            }
          },
          tooltip: {
            enabled: true
          }
        },
        scales: {
          x: {
            grid: {
              display: false,
              borderColor: "white"
            },
            ticks: {
              color: "white",
              autoSkipPadding: 30
            }
          },
          y: {
            min: 0,
            grid: {
              display: false,
              borderColor: "white"
            },
            ticks: {
              color: "white"
            }
          }
        }
      },
      data: {
        labels: chartData.dates.map((date) =>
          new Date(date).toLocaleDateString("pt", {
            day: "numeric",
            month: "short",
            year: "numeric"
          })
        ),
        datasets: [
          {
            label: "New cases",
            data: chartData.cases,
            fill: false,
            borderColor: "white",
            tension: 1
          }
        ]
      }
    };
  }
</script>

<div class="relative w-full h-full">
  {#if dailyDataLoading}
    <div in:fade out:fade={{ duration: 350 }} class="w-full h-full fixed top-0 left-0">
      <LoadingSpinner />
    </div>
  {:else}
    <div in:fade={{ delay: 400 }} out:fade>
      <p class="mb-4">
        {new Date(dailyData.currentDate).toLocaleString("pt-pt", {
          month: "long",
          day: "numeric",
          year: "numeric"
        })}
      </p>

      <div class="flex flex-col space-y-2 mb-8 sm:space-x-4 sm:space-y-0 sm:flex-row">
        <a
          href={dailyData.previousLink}
          class="underline"
          on:click={handleNavigation(dailyData.previousLink)}
          sveltekit:prefetch
        >
          Ver dados do dia anterior
        </a>

        {#if dailyData.nextLink}
          <a
            href={dailyData.nextLink}
            class="underline"
            on:click={handleNavigation(dailyData.nextLink)}
            sveltekit:prefetch
          >
            Ver dados do dia seguinte
          </a>

          <a href="/" class="underline" on:click={handleNavigation("/")} sveltekit:prefetch>
            Ver dados de hoje
          </a>
        {/if}
      </div>

      <div class="grid gap-2">
        <StatCard
          title="Casos"
          statCount={dailyData.cases}
          newStatCount={dailyData.newCases}
        />

        <StatCard
          title="Óbitos"
          statCount={dailyData.deaths}
          newStatCount={dailyData.newDeaths}
        />

        <StatCard
          title="Internados"
          statCount={dailyData.hospitalized}
          newStatCount={dailyData.newHospitalized}
        />

        <StatCard
          title="Cuidados Intensivos"
          statCount={dailyData.uci}
          newStatCount={dailyData.newUci}
        />
      </div>

      <div class="mt-10">
        <div class="flex flex-row gap-8 text-color mb-8 flex-wrap">
          <label>
            Start Date
            <input type="date" bind:value={chartStartDate} class="text-black rounded" />
          </label>

          <label>
            End Date
            <input type="date" bind:value={chartEndDate} class="text-black rounded" />
          </label>

          <button class="rounded bg-gray-200 text-black px-2 shadow-sm" on:click={updateChart}>
            Atualizar gráfico
          </button>
        </div>

        {#if chartDataLoading}
          <div class="h-[500px]">
            <LoadingSpinner />
          </div>
        {:else}
          <Chart width="1000" height="500" config={CHART_CONFIG} />
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .grid {
    grid-template-columns: repeat(auto-fit, minmax(theme("width.56"), 1fr));
  }
</style>
