<script lang="ts">
  import { getReadableProgressStore } from '@abcnews/progress-utils';
  import type { Progress } from '@abcnews/progress-utils';
  import { onMount } from 'svelte';
  import type { Readable } from 'svelte/store';
  import { createSimuation } from './simulation';
  import type { RunnerStarter } from './simulation';

  export let shouldRunSimulation: boolean = true;

  let el: HTMLElement;
  let graphicEl: HTMLElement;

  let timeoutId: NodeJS.Timeout;
  let runSimulation: RunnerStarter;

  const progressStore: Readable<Progress> = getReadableProgressStore(`header-media`, {
    indicatorSelector: '.Header-media',
    regionThreshold: 0
  });

  $: progress = $progressStore ? $progressStore.threshold : 0;
  $: if (shouldRunSimulation && !timeoutId && runSimulation && progress > 0) {
    timeoutId = setTimeout(runSimulation(), 5000);
  }

  onMount(() => {
    runSimulation = createSimuation(graphicEl);

    return () => clearTimeout(timeoutId);
  });
</script>

<div bind:this={el}>
  <figure bind:this={graphicEl} />
</div>

<style>
  div {
    position: relative;
    height: 1440px;
    background-color: #fff;
  }

  @media (min-width: 700px) and (max-width: 1799px) {
    div {
      height: 1080px;
    }
  }

  @media (max-width: 699px) {
    div {
      height: 720px;
    }
  }

  figure {
    transform: translate(-50%, 0);
    position: absolute;
    left: 50%;
    margin: 0 auto;
    width: 1440px;
    height: 100%;
  }

  @media (min-width: 700px) and (max-width: 1799px) {
    figure {
      width: 1080px;
    }
  }

  @media (max-width: 699px) {
    figure {
      width: 720px;
    }
  }

  figure::before,
  figure::after {
    content: '';
    z-index: 1;
    position: absolute;
    bottom: 0;
    width: 1080px;
    background-color: #000;
  }

  figure::before {
    right: calc(100% - 2px);
    height: 7.5%;
  }

  figure::after {
    left: calc(100% - 2px);
    height: 40.4%;
  }

  figure > :global(canvas) {
    width: 100% !important;
    height: 100% !important;
  }
</style>
