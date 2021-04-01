<script lang="ts" context="module">
	import { CovidData } from '$lib/CovidData';
	import type { LoadInput, LoadOutput } from '@sveltejs/kit/types.internal';

	export async function load({ fetch, page }: LoadInput): Promise<LoadOutput> {
		const date = page.query.get('date');
		const url = date ? `/api/covidData.json?date=${date}` : '/api/covidData.json';
		const res = ((await fetch(url, {
			credentials: 'omit'
		})) as unknown) as Response;

		if (res.ok) {
			const data = await res.json();

			return {
				props: {
					data: await new CovidData(data)
				},
				maxage: 3600
			};
		}
	}
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import StatCard from '$lib/StatCard.svelte';

	export let data: CovidData;

	let loading = false;

	function handleNavigation(url) {
		return async (event) => {
			event.preventDefault();

			// This code looks a bit convuluted
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

<main class="max-w-5xl mx-auto py-12 text-white px-6">
	<h1 class="text-3xl mb-4">Ponto situação COVID em Portugal</h1>

	{#if loading}
		loading
	{:else}
		<div in:fade>
			<p class="mb-2">
				{data.currentDate.toLocaleString(undefined, {
					month: 'long',
					day: 'numeric',
					year: 'numeric'
				})}
			</p>

			<div class="flex flex-row space-x-8 mb-8">
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

					<a href="/" class="underline" on:click={handleNavigation('/')} sveltekit:prefetch>
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
</main>

<style>
	.grid {
		grid-template-columns: repeat(auto-fit, minmax(theme('width.56'), 1fr));
	}
</style>
