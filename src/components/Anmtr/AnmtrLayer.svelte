<script lang="ts">
  import { getStyle } from '@abcnews/anmtr/utils.js';
  import type { Layer } from '@abcnews/anmtr/types';

  export let layer: Layer;
  export let stageWidth: number;
  export let stageHeight: number;
  export let progress: number = 0;

  let layerWidth: number;
  let layerHeight: number;

  $: style = getStyle(
    layer,
    progress,
    { width: stageWidth, height: stageHeight },
    { width: layerWidth, height: layerHeight }
  );
</script>

{#if style}
  <div bind:clientWidth={layerWidth} bind:clientHeight={layerHeight}>
    {#if layer.src}
      <img {style} src={layer.src} alt={layer.name} />
    {:else}
      <figure {style}>{layer.name}</figure>
    {/if}
  </div>
{/if}

<style>
  div {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  figure {
    width: 100px;
    height: 100px;
    border: 1px solid rosybrown;
  }

  img {
    max-width: none !important;
  }
</style>
