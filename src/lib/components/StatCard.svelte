<script lang="ts">
  export let title: string;
  export let statCount: number;
  export let newStatCount: number;
</script>

<div class="flex flex-col justify-between p-4 rounded shadow bg-gray-600">
  <h2 class="text-lg">{title}</h2>

  <div class="flex flex-row space-x-1 mt-2">
    <p class="text-white">{statCount.toLocaleString()}</p>

    <p class:text-green-500={newStatCount <= 0} class:text-red-500={newStatCount > 0}>
      ({newStatCount.toLocaleString()})
    </p>
  </div>
</div>
