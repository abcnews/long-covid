<script lang="ts" context="module">
  const GRAPHIC_PATH = `${__webpack_public_path__}scattered-glyphs/graphic.svg`;

  const interpolate = (progress: number) => {
    if (progress < 0.2) {
      return (0.3333 / 0.2) * progress;
    } else if (progress < 0.4) {
      return 0.3333;
    } else if (progress < 0.6) {
      return 0.3333 + (0.3333 / 0.2) * (progress - 0.4);
    } else if (progress < 0.8) {
      return 0.6667;
    } else {
      return 0.6667 + (0.3333 / 0.2) * (progress - 0.8);
    }
  };
  // const interpolate = (progress: number) => {
  //   if (progress < 0.1667) {
  //     return (0.3333 / 0.1667) * progress;
  //   } else if (progress < 0.3333) {
  //     return 0.3333;
  //   } else if (progress < 0.5) {
  //     return 0.3333 + (0.3333 / 0.1667) * (progress - 0.3333);
  //   } else if (progress < 0.6667) {
  //     return 0.6667;
  //   } else if (progress < 0.8333) {
  //     return 0.6667 + (0.3333 / 0.1667) * (progress - 0.6667);
  //   } else {
  //     return 1;
  //   }
  // };
</script>

<script lang="ts">
  import { getReadableProgressStore } from '@abcnews/progress-utils';
  import type { Progress } from '@abcnews/progress-utils';
  import type { Readable } from 'svelte/store';

  export let mountIndex: number;

  let iframeEl: HTMLIFrameElement;
  let isIFrameReady: boolean = false;
  let progressStore: Readable<Progress> = getReadableProgressStore(`scatteredglyphs_${mountIndex}`, {
    indicatorSelector: `[data-scatteredglyphs="${mountIndex}"] + .Block > .Block-content > *`
  });

  $: progress = $progressStore ? $progressStore.threshold : 0;
  $: isIFrameReady &&
    iframeEl.contentWindow &&
    iframeEl.contentWindow.postMessage({ type: 'progress', payload: interpolate(progress) }, '*');
</script>

<div>
  <figure role="presentation">
    <iframe
      title="Graphic"
      bind:this={iframeEl}
      frameBorder="0"
      scrolling="no"
      src={`${GRAPHIC_PATH}?global=paused`}
      on:load={() => (isIFrameReady = true)}
    />
  </figure>
</div>

<style>
  :global([data-scatteredglyphs]) + :global(.Block) > :global(.Block-content) {
    opacity: 0;
  }

  :global([data-scatteredglyphs]) + :global(.Block) > :global(.Block-content):nth-child(2) > :global(:first-child) {
    margin-top: 40vh !important;
  }

  :global([data-scatteredglyphs]) + :global(.Block) > :global(.Block-content):last-child > :global(:first-child) {
    margin-bottom: 40vh !important;
  }

  div {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  figure {
    position: relative;
    margin: auto;
    width: 100%;
    max-width: 640px;
    height: 0;
    padding-top: 66.67%;
  }

  iframe {
    transform: translate(-50%, -50%);
    position: absolute;
    top: 50%;
    left: 50%;
    width: 120%;
    height: 120%;
  }
</style>
