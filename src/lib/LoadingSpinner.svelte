<script>
  import { fade } from "svelte/transition";
</script>

<div in:fade class="w-full h-full flex flex-col justify-center items-center">
  <div class="loading" />
</div>

<style>
  .loading {
    display: inline-block;
    width: 80px;
    height: 80px;
  }

  .loading:after {
    content: " ";
    display: block;
    width: 64px;
    height: 64px;
    margin: 8px;
    border-radius: 50%;
    border: 6px solid #fff;
    border-color: #fff transparent #fff transparent;
    animation: rotate 1.2s linear infinite;
  }

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
