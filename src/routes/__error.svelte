<script context="module" lang="ts">
  import type { ErrorLoad } from "@sveltejs/kit";

  export const load: ErrorLoad = async ({ error, status }) => {
    return {
      props: {
        error,
        status
      }
    };
  };
</script>

<script>
  export let status;
  export let error;

  $: console.log(status, error);
</script>

<div class="h-full flex flex-col items-center text-center max-w-md mx-auto">
  <p class="text-xl mt-48">
    {#if status === 404}
      Não conseguimos encontrar a página que pretende.
    {:else}
      Erro grave, não conseguimos processar este pedido. Por favor tente mais tarde.
    {/if}
  </p>

  <a class="block text-lg mt-8 underline" href="/">Voltar à pagina principal</a>
</div>
