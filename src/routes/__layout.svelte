<script>
  import "../global.css";
</script>

<div class="max-w-5xl mx-auto py-12 text-white px-6 h-screen flex flex-col">
  <nav class="mb-8">
    <a href="/">
      <h1 class="text-3xl ">Ponto situação COVID em Portugal</h1>

      <p>Dados retirados da <a class="underline" href="https://github.com/dssg-pt/covid19pt-data">DSSG-PT</a></p>
    </a>
  </nav>

  <main class="flex-grow">
    <slot />
  </main>
</div>
