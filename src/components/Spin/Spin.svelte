<script lang="ts" context="module">
  const GRAPHIC_PATH = `${__webpack_public_path__}spin/graphic.svg`;
</script>

<script lang="ts">
  import { getReadableProgressStore } from '@abcnews/progress-utils';
  import type { Progress } from '@abcnews/progress-utils';
  import type { Readable } from 'svelte/store';

  export let text: string;

  let [textBefore, textAfter] = text.split('spin');

  let iframeEl: HTMLIFrameElement;
  let isIFrameReady: boolean = false;
  let progressStore: Readable<Progress> = getReadableProgressStore('spin', {
    regionTop: 0,
    regionThreshold: 0.2, // unused, but must be between regionTop and regionBottom
    regionBottom: 0.4,
    indicatorSelector: `[data-spin]`
  });

  $: progress = $progressStore ? Math.min($progressStore.region, 0.999) : 0;
  $: isIFrameReady &&
    iframeEl.contentWindow &&
    iframeEl.contentWindow.postMessage({ type: 'progress', payload: progress }, '*');
</script>

<p>
  {textBefore}
  <bdo dir="ltr">
    <span>
      <iframe
        bind:this={iframeEl}
        title="Graphic"
        frameBorder="0"
        scrolling="no"
        src={`${GRAPHIC_PATH}?global=paused`}
        on:load={() => (isIFrameReady = true)}
      /><ins>spin</ins></span
    >
    <span style={`opacity:${progress > 0.125 ? 0 : 1}`}>{textAfter}</span>
  </bdo>
</p>

<style>
  p {
    width: 100%;
  }

  bdo {
    white-space: nowrap;
  }

  span {
    position: relative;
    display: inline-block;
  }

  iframe {
    position: absolute;
    top: -15.35em;
    left: -9.55em;
    width: 32.75em;
    max-width: none;
    height: 32.75em;
    pointer-events: none;
  }

  @media (min-width: 700px) {
    iframe {
      top: -15.22em;
      left: -9.6em;
    }
  }

  ins {
    opacity: 0;
  }

  span + span {
    transition: opacity 0.25s;
  }
</style>
