<script lang="ts" context="module">
  import type { Load } from "@sveltejs/kit";

  export const load: Load = async ({ fetch, page }) => {
    const date = page.query.get("date");
    const url = date ? `/api/covidData.json?date=${date}` : "/api/covidData.json";
    const res: Response = (await fetch(url, { credentials: "omit" })) as never;

    if (res.ok) {
      const data = await res.json();

      return {
        props: {
          data
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
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import StatCard from "$lib/StatCard.svelte";
  import LoadingSpinner from "$lib/LoadingSpinner.svelte";

  export let data: DailyCovidData;

  let loading = false;

  function handleNavigation(url) {
    return async (event) => {
      event.preventDefault();

      // This code looks a bit convoluted
      // but it's to basically artificially delay
      // all requests by 500ms to give a nice
      // transition
      const delay = () =>
        setTimeout(() => {
          if (navigated) loading = false;
          else delay();
        }, 500);

      let navigated = false;
      loading = true;
      delay();
      await goto(url);
      navigated = true;
    };
  }
</script>

{#if loading}
  <LoadingSpinner />
{:else}
  <div in:fade>
    <p class="mb-4">
      {new Date(data.currentDate).toLocaleString("pt-pt", {
        month: "long",
        day: "numeric",
        year: "numeric"
      })}
    </p>

    <div class="flex flex-col space-y-2 mb-8 sm:space-x-4 sm:space-y-0 sm:flex-row">
      <a
        href={data.previousLink}
        class="underline"
        on:click={handleNavigation(data.previousLink)}
        sveltekit:prefetch
      >
        Ver dados do dia anterior
      </a>

      {#if data.nextLink}
        <a
          href={data.nextLink}
          class="underline"
          on:click={handleNavigation(data.nextLink)}
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
      <StatCard title="Casos" statCount={data.cases} newStatCount={data.newCases} />

      <StatCard title="Óbitos" statCount={data.deaths} newStatCount={data.newDeaths} />

      <StatCard
        title="Internados"
        statCount={data.hospitalized}
        newStatCount={data.newHospitalized}
      />

      <StatCard title="Cuidados Intensivos" statCount={data.uci} newStatCount={data.newUci} />
    </div>
  </div>
{/if}

<style>
  .grid {
    grid-template-columns: repeat(auto-fit, minmax(theme("width.56"), 1fr));
  }
</style>
