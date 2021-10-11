<script lang="ts" context="module">
  const GRAPHIC_PATH = `${__webpack_public_path__}mind/graphic.svg`;
</script>

<script lang="ts">
  import { getReadableProgressStore } from '@abcnews/progress-utils';
  import type { Progress } from '@abcnews/progress-utils';
  import type { Readable } from 'svelte/store';

  export let text: string;

  let [textBefore, textAfter] = text.split('mind');

  let iframeEl: HTMLIFrameElement;
  let isIFrameReady: boolean = false;
  let progressStore: Readable<Progress> = getReadableProgressStore('mind', {
    regionThreshold: 0.5,
    indicatorSelector: `[data-mind]`
  });

  $: progress = $progressStore ? $progressStore.threshold : 0;
  $: isIFrameReady &&
    iframeEl.contentWindow &&
    iframeEl.contentWindow.postMessage({ type: 'progress', payload: progress }, '*');
</script>

<p>
  {textBefore}
  <span>
    <iframe
      bind:this={iframeEl}
      title="Graphic"
      frameBorder="0"
      scrolling="no"
      src={`${GRAPHIC_PATH}?global=paused`}
      on:load={() => (isIFrameReady = true)}
    /><ins>mind</ins></span
  >
  <span style={`opacity:${progress > 0 ? 0 : 1}`}>{textAfter}</span>
</p>

<style>
  p {
    padding-bottom: 45em;
    width: 100%;
  }

  span {
    position: relative;
    display: inline-block;
  }

  iframe {
    position: absolute;
    top: -1.35em;
    left: -25.62em;
    width: 47.44em;
    max-width: none;
    height: 47.44em;
    pointer-events: none;
    -webkit-mask-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 3%, rgba(0, 0, 0, 1) 85%, rgba(0, 0, 0, 0));
    mask-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 3%, rgba(0, 0, 0, 1) 85%, rgba(0, 0, 0, 0));
    transition: transform 0.25s linear;
  }

  ins {
    opacity: 0;
  }

  span + span {
    transition: opacity 0.25s;
  }
</style>
