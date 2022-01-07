<script>
  import "../global.css";
</script>

<div class="max-w-5xl mx-auto py-12 text-white px-6 h-screen flex flex-col">
  <nav>
    <a href="/">
      <h1 class="text-3xl mb-4">Ponto situação COVID em Portugal</h1>

      <p>Dados retirados da <a class="underline" href="https://covid19-api.vost.pt/">VOST</a></p>
    </a>
  </nav>

  <main class="flex-grow">
    <slot />
  </main>
</div>
