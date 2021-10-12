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
    regionThreshold: 0.4,
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
    margin-bottom: 10em;
    padding-bottom: 50em;
    width: 100%;
  }

  span {
    position: relative;
    display: inline-block;
  }

  iframe {
    position: absolute;
    top: -1.42em;
    left: -32.75em;
    width: 61.672em;
    max-width: none;
    height: 61.672em;
    pointer-events: none;
    -webkit-mask-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 3%, rgba(0, 0, 0, 1) 85%, rgba(0, 0, 0, 0));
    mask-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 3%, rgba(0, 0, 0, 1) 85%, rgba(0, 0, 0, 0));
    transition: transform 0.25s linear;
  }

  @media (min-width: 700px) {
    iframe {
      top: -1.4em;
    }
  }

  ins {
    opacity: 0;
  }

  span + span {
    transition: opacity 0.25s;
  }
</style>
