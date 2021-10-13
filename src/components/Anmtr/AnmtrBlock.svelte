<script lang="ts" context="module">
  import type { Layer } from '@abcnews/anmtr/types';

  const BASE_PATH = `${__webpack_public_path__}anmtr/`;
  const STAGE_TO_BLOCK_HEIGHT_RATIOS = {
    adam: 1.5,
    bronwyn: 2,
    freya: 2,
    judy: 2
  };
  const ALTERNATIVE_TEXTS = {
    adam: 'Image of Adam standing in front of a park looking at the Eiffel tower in the distance blurs into obscurity.',
    bronwyn:
      'Image 1 of young Bronwyn sitting on a stone wall overlooking a Croatian city blurs and transitions to Image 2 of an older Bronwyn sitting in a wheelchair by the road.',
    freya:
      'Image 1 of Freya standing in a European location wearing a black winter coat blurs and transitions to Image 2 of Freya sitting in a hospital bed wearing a face mask and gown.',
    judy: 'Image 1 of smiling Judy holding her baby daughter on her shoulders in the park blurs and transitions to Image 2 of Judy looking sad while laying in bed with her two children.'
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
  <div
    style={`margin:${stageHeight / 2}px 0;height:${blockHeight}px`}
    role={ALTERNATIVE_TEXTS[name] ? 'img' : 'presentation'}
    aria-label={ALTERNATIVE_TEXTS[name] || undefined}
  >
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
