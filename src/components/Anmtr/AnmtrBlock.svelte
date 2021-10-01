<script lang="ts" context="module">
  import type { Layer } from '@abcnews/anmtr/types';

  const BASE_PATH = `${__webpack_public_path__}anmtr/`;
  const STAGE_SCROLL_DISTANCES = {
    freya: 4500,
    judy: 2000
  };

  const fetchLayers = async (name: string): Promise<Layer[]> =>
    fetch(`${BASE_PATH}${name}.json`).then(response => response.json());
</script>

<script lang="ts">
  import { getReadableProgressStore } from '@abcnews/progress-utils';
  import type { Progress } from '@abcnews/progress-utils';
  import type { Readable } from 'svelte/store';
  import AnmtrStage from './AnmtrStage.svelte';

  export let name: string;

  let stageScrollDistance: number | null = STAGE_SCROLL_DISTANCES[name] || null;

  let progressStore: Readable<Progress> = getReadableProgressStore(`anmtr_${name}`, {
    indicatorSelector: `[data-anmtr="${name}"]`
  });
</script>

<div style={stageScrollDistance === null ? undefined : `height:${stageScrollDistance}px`}>
  {#await fetchLayers(name)}
    <p>Loading</p>
  {:then layers}
    <AnmtrStage {progressStore} {layers} />
  {/await}
</div>

<style>
  div {
    position: relative;
    min-height: 200vh;
  }
</style>
