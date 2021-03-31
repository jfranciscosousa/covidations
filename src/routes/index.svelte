<script lang="ts" context="module">
	import { CovidData } from '$lib/CovidData';
	import type { LoadInput, LoadOutput } from '@sveltejs/kit/types.internal';

	export async function load({ fetch }: LoadInput): Promise<LoadOutput> {
		const res = ((await fetch('/covidData.json', { credentials: 'omit' })) as unknown) as Response;

		if (res.ok) {
			const data = await res.json();

			return {
				props: {
					data: await new CovidData(data.prevData, data.currData, data.date)
				},
				maxage: 3600
			};
		}
	}
</script>

<script lang="ts">
	import StatCard from '$lib/StatCard.svelte';

	export let data: CovidData;
</script>

<main class="max-w-4xl mx-auto py-12 text-white">
	<h1 class="text-4xl mb-4">Portugal Covid Summary</h1>

	<p class="mb-8">
		{data.date.toLocaleString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
	</p>

	<div class="grid grid-cols-4 gap-4">
		<StatCard title="Casos" statCount={data.cases} newStatCount={data.newCases} />

		<StatCard title="Óbitos" statCount={data.deaths} newStatCount={data.newDeaths} />

		<StatCard
			title="Internados"
			statCount={data.hospitalized}
			newStatCount={data.newHospitalized}
		/>

		<StatCard title="Cuidados Intensivos" statCount={data.uci} newStatCount={data.newUci} />
	</div>
</main>
