<script lang="ts">
  import type { Layer } from '@abcnews/anmtr/types';
  import type { Progress } from '@abcnews/progress-utils';
  import type { Readable } from 'svelte/store';
  import AnmtrLayer from './AnmtrLayer.svelte';

  export let progressStore: Readable<Progress>;
  export let layers: Layer[] = [];
  export let timelineFactor: number = 1;

  let stageHeight: number;
  let stageWidth: number;

  $: progress = $progressStore ? Math.min($progressStore.envelope / timelineFactor, 1) : 0;
</script>

<div
  class:before={progress === 0}
  class:during={progress > 0 && progress < 1}
  class:after={progress === 1}
  bind:clientHeight={stageHeight}
  bind:clientWidth={stageWidth}
>
  {#each layers as layer (layer.id)}
    <AnmtrLayer {stageHeight} {stageWidth} {layer} {progress} />
  {/each}
</div>

<style>
  div {
    left: 0;
    width: 100%;
    height: 100vh;
  }

  .before,
  .after {
    position: absolute;
  }

  .before,
  .during {
    top: 0;
  }

  .during {
    position: fixed;
  }

  .after {
    top: auto;
    bottom: 0;
  }
</style>
