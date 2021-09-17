<script lang="ts" context="module">
  const GRAPHIC_BASE_PATH = `${__webpack_public_path__}scattered-glyphs/`;
  const FIRST_NAME = 'fever';
  const LAST_NAME = 'ok';
  const VISIBLE_FROM = 0.4;
  const VISIBLE_UNTIL = 0.6;

  const interpolate = (progress: number, name: string) => {
    if (progress < VISIBLE_FROM && name !== FIRST_NAME) {
      return (0.5 / VISIBLE_FROM) * progress;
    } else if (progress < VISIBLE_UNTIL || name === LAST_NAME) {
      return 0.5;
    } else {
      return 0.5 + (0.5 / (1 - VISIBLE_UNTIL)) * (progress - VISIBLE_UNTIL);
    }
  };
</script>

<script lang="ts">
  import { getReadableProgressStore } from '@abcnews/progress-utils';
  import type { Progress } from '@abcnews/progress-utils';
  import type { Readable } from 'svelte/store';

  export let name: string;

  let iframeEl: HTMLIFrameElement;
  let isIFrameReady: boolean = false;
  let progressStore: Readable<Progress> = getReadableProgressStore(`scatteredglyphs_${name}`, {
    indicatorSelector: `[data-scatteredglyphs="${name}"]`,
    regionTop: 0.5,
    regionThreshold: 0.575,
    regionBottom: 0.65
  });

  $: progress = $progressStore ? $progressStore.region : 0;
  $: isIFrameReady &&
    iframeEl.contentWindow &&
    iframeEl.contentWindow.postMessage({ type: 'progress', payload: interpolate(progress, name) }, '*');
</script>

<p>
  <iframe
    title="Graphic"
    bind:this={iframeEl}
    frameBorder="0"
    scrolling="no"
    src={`${GRAPHIC_BASE_PATH}${name}.svg?global=paused`}
    on:load={() => (isIFrameReady = true)}
  />
</p>

<style>
  :global([data-scatteredglyphs]) ~ :global([data-scatteredglyphs]) {
    margin-top: 4.5em;
  }

  :global([data-scatteredglyphs]) + :global(p) + :global(p) {
    margin-top: 2.25em;
  }

  p {
    position: relative;
    width: 100%;
    height: 1.555555556em;
  }

  @media (min-width: 700px) {
    p {
      height: 1.666666667em;
    }
  }

  iframe {
    transform: translate(0, -50%);
    position: absolute;
    top: 90%;
    width: 20em;
    height: 15em;
  }

  :global([data-scatteredglyphs='fever']) iframe {
    left: -3.25em;
  }

  :global([data-scatteredglyphs='throat']) iframe {
    left: -3em;
  }

  :global([data-scatteredglyphs='dizziness']) iframe {
    left: -2.625em;
  }

  :global([data-scatteredglyphs='ok']) iframe {
    left: -3.625em;
  }
</style>
