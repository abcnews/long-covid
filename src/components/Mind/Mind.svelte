<script lang="ts" context="module">
  const GRAPHIC_PATH = `${__webpack_public_path__}mind/graphic.svg`;

  const interpolateGraphicYOffset = (progress: number) => {
    if (progress < 0.2) {
      return 0;
    } else {
      return (progress - 0.2) * 1.25;
    }
  };
</script>

<script lang="ts">
  import { getReadableProgressStore } from '@abcnews/progress-utils';
  import type { Progress } from '@abcnews/progress-utils';
  import { spring } from 'svelte/motion';
  import type { Readable } from 'svelte/store';

  export let text: string;

  let [textBefore, textAfter] = text.split('mind');
  let graphicYOffset = spring(0);

  let iframeEl: HTMLIFrameElement;
  let isIFrameReady: boolean = false;
  let progressStore: Readable<Progress> = getReadableProgressStore('mind', {
    regionThreshold: 0.4,
    indicatorSelector: `[data-mind]`
  });

  $: progress = $progressStore ? $progressStore.threshold : 0;
  $: graphicYOffset.set(interpolateGraphicYOffset(progress));
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
      style={`transform:translate(0,${$graphicYOffset * 35}em)`}
      frameBorder="0"
      scrolling="no"
      src={`${GRAPHIC_PATH}?global=paused`}
      on:load={() => (isIFrameReady = true)}
    /><ins>mind</ins></span
  >
  {textAfter}
</p>

<style>
  p {
    padding-bottom: 75em;
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
</style>
