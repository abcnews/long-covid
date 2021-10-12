<script lang="ts" context="module">
  import type { Layer } from '@abcnews/anmtr/types';

  const BASE_PATH = `${__webpack_public_path__}anmtr/`;
  const STAGE_TO_BLOCK_HEIGHT_RATIOS = {
    adam: 1.5,
    bronwyn: 2,
    freya: 3,
    judy: 2
  };
  const STAGE_WIDTH_HEIGHT_RATIO = (1 / 2) * 3;

  const fetchLayers = async (name: string): Promise<Layer[]> =>
    fetch(`${BASE_PATH}${name}.json`).then(response => response.json());
</script>

<script lang="ts">
  import { getReadableProgressStore } from '@abcnews/progress-utils';
  import type { Progress } from '@abcnews/progress-utils';
  import { onMount } from 'svelte';
  import type { Readable } from 'svelte/store';
  import AnmtrStage from './AnmtrStage.svelte';

  export let name: string;

  let innerWidth: number;
  let innerHeight: number;

  let layers: Layer[] = [];
  let stageWidth: number;
  let stageHeight: number;
  let blockHeight: number;
  let progressStore: Readable<Progress>;

  onMount(async () => {
    layers = await fetchLayers(name);
    stageWidth = layers.reduce(
      (memo, layer) =>
        layer.constrainWidth ? Math.max(Math.min(memo, layer.widthConstraint.max), layer.widthConstraint.min) : memo,
      innerWidth
    );
    stageHeight = stageWidth * STAGE_WIDTH_HEIGHT_RATIO;
    blockHeight = stageHeight * (STAGE_TO_BLOCK_HEIGHT_RATIOS[name] || 1);
    progressStore = getReadableProgressStore(`anmtr_${name}`, {
      indicatorSelector: `[data-anmtr="${name}"]>*`,
      regionThreshold: 0.5
    });
  });
</script>

<svelte:window bind:innerWidth bind:innerHeight />

{#if layers}
  <div style={`margin:${stageHeight / 2}px 0;height:${blockHeight}px`}>
    <AnmtrStage {stageWidth} {stageHeight} {progressStore} {layers} />
  </div>
{/if}

<style>
  :global([data-anmtr]) {
    /* stop margin collapse */
    min-height: auto !important;
  }
  div {
    position: relative;
    min-height: 100vh;
  }
</style>
