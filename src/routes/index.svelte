<script lang="ts" context="module">
  import type { Load } from "@sveltejs/kit";

  export const load: Load = async ({ fetch, page }) => {
    const date = page.query.get("date");
    const url = date ? `/api/dailyCovidData.json?date=${date}` : "/api/dailyCovidData.json";
    const res: Response = (await fetch(url, { credentials: "omit" })) as never;
    const timelineRes: Response = (await fetch("/api/historicalCovidData.json", {
      credentials: "omit"
    })) as never;

    if (res.ok) {
      const data = await res.json();
      const timelineData = await timelineRes.json();

      return {
        props: {
          mainState: {
            data,
            loading: false
          },
          chartState: {
            data: timelineData,
            loading: false
          }
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
  import { format } from "date-fns";
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import StatCard from "$lib/StatCard.svelte";
  import LoadingSpinner from "$lib/LoadingSpinner.svelte";
  import Chart from "$lib/Chart.svelte";
  import type { DailyCovidData } from "$lib/types";

  export let mainState: { loading: boolean; data: DailyCovidData };
  export let chartState: { loading: boolean; data: any };

  let loading = false;
  let startDate = format(new Date("02/26/2020"), "yyyy-MM-dd");
  let endDate = format(new Date(), "yyyy-MM-dd");

  function handleNavigation(url) {
    return async (event) => {
      event.preventDefault();

      // This code looks a bit convoluted
      // but it's to basically artificially delay
      // all requests by 500ms to give a nice
      // transition
      const delay = () =>
        setTimeout(() => {
          if (navigated) mainState.loading = false;
          else delay();
        }, 500);

      let navigated = false;
      mainState.loading = true;
      delay();
      await goto(url);
      navigated = true;
    };
  }

  async function updateChart() {
    try {
      chartState.loading = true;
      chartState.data = await (
        await fetch(`/api/historicalCovidData.json?start=${startDate}&end=${endDate}`)
      ).json();
    } catch (error) {
      // ignore error and keep original state
    } finally {
      chartState.loading = false;
    }
  }
</script>

{#if loading}
  <LoadingSpinner />
{:else}
  <div in:fade>
    <p class="mb-4">
      {new Date(mainState.data.currentDate).toLocaleString("pt-pt", {
        month: "long",
        day: "numeric",
        year: "numeric"
      })}
    </p>

    <div class="flex flex-col space-y-2 mb-8 sm:space-x-4 sm:space-y-0 sm:flex-row">
      <a
        href={mainState.data.previousLink}
        class="underline"
        on:click={handleNavigation(mainState.data.previousLink)}
        sveltekit:prefetch
      >
        Ver dados do dia anterior
      </a>

      {#if mainState.data.nextLink}
        <a
          href={mainState.data.nextLink}
          class="underline"
          on:click={handleNavigation(mainState.data.nextLink)}
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
        statCount={mainState.data.cases}
        newStatCount={mainState.data.newCases}
      />

      <StatCard
        title="Óbitos"
        statCount={mainState.data.deaths}
        newStatCount={mainState.data.newDeaths}
      />

      <StatCard
        title="Internados"
        statCount={mainState.data.hospitalized}
        newStatCount={mainState.data.newHospitalized}
      />

      <StatCard
        title="Cuidados Intensivos"
        statCount={mainState.data.uci}
        newStatCount={mainState.data.newUci}
      />
    </div>

    <div class="mt-10">
      <div class="flex flex-row gap-8 text-color mb-8 flex-wrap">
        <label>
          Start Date
          <input type="date" bind:value={startDate} class="text-black rounded" />
        </label>

        <label>
          End Date
          <input type="date" bind:value={endDate} class="text-black rounded" />
        </label>

        <button class="rounded bg-gray-200 text-black px-2 shadow-sm" on:click={updateChart}>
          Atualizar gráfico
        </button>
      </div>

      {#if chartState.loading}
        <div class="h-[500px]">
          <LoadingSpinner />
        </div>
      {:else}
        <Chart
          width="1000"
          height="500"
          config={{
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
              labels: chartState.data.dates.map((date) =>
                new Date(date).toLocaleDateString("pt", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                })
              ),
              datasets: [
                {
                  label: "New cases",
                  data: chartState.data.cases,
                  fill: false,
                  borderColor: "white",
                  tension: 1
                }
              ]
            }
          }}
        />
      {/if}
    </div>
  </div>
{/if}

<style>
  .grid {
    grid-template-columns: repeat(auto-fit, minmax(theme("width.56"), 1fr));
  }
</style>
