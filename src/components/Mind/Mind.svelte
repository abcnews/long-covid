<script lang="ts" context="module">
  const IS_SAFARI = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  const GRAPHIC_PATH = `${__webpack_public_path__}mind/graphic${IS_SAFARI || IS_IOS ? '__safari' : ''}.svg`;
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
  <bdo dir="ltr">
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
  </bdo>
</p>

<style>
  p {
    margin-bottom: 25em;
    padding-bottom: 60em;
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
    z-index: -1;
    position: absolute;
    top: -1.42em;
    left: -44.625em;
    width: 85.392em;
    max-width: none;
    height: 85.392em;
    pointer-events: none;
    -webkit-mask-image: linear-gradient(rgba(0, 0, 0, 1) 95%, rgba(0, 0, 0, 0));
    mask-image: linear-gradient(rgba(0, 0, 0, 1) 95%, rgba(0, 0, 0, 0));
  }

  @media (min-width: 700px) {
    iframe {
      top: -1.38em;
    }
  }

  ins {
    opacity: 0;
  }

  span + span {
    transition: opacity 0.25s;
  }
</style>
