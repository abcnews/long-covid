<script lang="ts">
  import type { Layer } from '@abcnews/anmtr/types';
  import type { Progress } from '@abcnews/progress-utils';
  import type { Readable } from 'svelte/store';
  import AnmtrLayer from './AnmtrLayer.svelte';

  export let layers: Layer[] = [];
  export let progressStore: Readable<Progress>;
  export let stageHeight: number;
  export let stageWidth: number;

  $: progress = $progressStore ? $progressStore.threshold : 0;
</script>

<div
  class:before={progress === 0}
  class:during={progress > 0 && progress < 1}
  class:after={progress === 1}
  style={`width:${stageWidth}px;height:${stageHeight}px`}
>
  {#each [...layers].reverse() as layer (layer.id)}
    <AnmtrLayer {stageHeight} {stageWidth} {layer} {progress} />
  {/each}
</div>

<style>
  div {
    transform: translate(-50%, -50%);
    position: absolute;
    left: 50%;
    top: 0;
  }

  .during {
    position: fixed;
    top: 50%;
  }

  .after {
    top: 100%;
  }
</style>
