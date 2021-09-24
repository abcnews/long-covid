<script lang="ts" context="module">
  const GRAPHIC_BASE_PATH = `${__webpack_public_path__}falling-through/`;
</script>

<script lang="ts">
  import { getReadableProgressStore } from '@abcnews/progress-utils';
  import type { Progress } from '@abcnews/progress-utils';
  import type { Readable } from 'svelte/store';

  export let word: string;
  export let text: string;

  let [textBefore, textAfter] = text.split(word);

  let iframeEl: HTMLIFrameElement;
  let isIFrameReady: boolean = false;
  let progressStore: Readable<Progress> = getReadableProgressStore(`fallingthrough_${word}`, {
    regionTop: -0.4,
    regionBottom: 0.6,
    indicatorSelector: `[data-fallingthrough="${word}"]`
  });

  $: progress = $progressStore ? $progressStore.region : 0;
  $: isIFrameReady &&
    iframeEl.contentWindow &&
    iframeEl.contentWindow.postMessage({ type: 'progress', payload: progress * 0.9 }, '*');
</script>

<p>
  {textBefore}
  <span>
    <iframe
      title="Graphic"
      bind:this={iframeEl}
      frameBorder="0"
      scrolling="no"
      src={`${GRAPHIC_BASE_PATH}${word}.svg?global=paused`}
      on:load={() => (isIFrameReady = true)}
    /><ins>{word}</ins></span
  >
  {textAfter}
</p>

<style>
  p {
    margin-bottom: 30em;
    width: 100%;
    height: 1.555555556em;
  }

  @media (min-width: 700px) {
    p {
      height: 1.666666667em;
    }
  }

  span {
    position: relative;
    display: inline-block;
  }

  iframe {
    position: absolute;
    width: 26em;
    max-width: none;
    height: 46em;
  }

  :global([data-fallingthrough='mind']) iframe {
    top: -11.35em;
    left: -14.89em;
  }

  ins {
    opacity: 0;
  }
</style>
