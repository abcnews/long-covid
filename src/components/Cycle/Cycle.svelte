<script lang="ts" context="module">
  const BASE_PATH = `${__webpack_public_path__}cycle/`;
  const CLOCK_GRAPHIC_PATH = `${BASE_PATH}clock.svg?global=paused`;
  const FEVER_GRAPHIC_PATH = `${BASE_PATH}fever.svg?global=paused`;
  const TEXT_AND_PERSON_GRAPHIC_PATH = `${BASE_PATH}text_and_person.svg?global=paused`;

  const interpolateFixedGraphicsOpacity = (progress: number) => {
    if (progress < 0.025) {
      return 0;
    } else if (progress < 0.125) {
      return (progress - 0.025) * 10;
    } else if (progress <= 0.9) {
      return 1;
    } else {
      return (1 - progress) * 10;
    }
  };

  const interpolateTextAndPersonGraphicProgress = (progress: number) => {
    if (progress < 0.2) {
      return (0.3333 / 0.2) * progress;
    } else if (progress < 0.3) {
      return 0.3333;
    } else if (progress < 0.5) {
      return 0.3333 + (0.3333 / 0.2) * (progress - 0.3);
    } else if (progress < 0.6) {
      return 0.6667;
    } else if (progress < 0.8) {
      return 0.6667 + (0.3333 / 0.2) * (progress - 0.6);
    } else {
      return 1;
    }
  };
</script>

<script lang="ts">
  import { getReadableProgressStore } from '@abcnews/progress-utils';
  import type { Progress } from '@abcnews/progress-utils';
  import { spring } from 'svelte/motion';
  import type { Readable } from 'svelte/store';

  let clockIframeEl: HTMLIFrameElement;
  let feverIframeEl: HTMLIFrameElement;
  let textAndPersonIframeEl: HTMLIFrameElement;
  let isClockIframeReady: boolean = false;
  let isFeverIframeReady: boolean = false;
  let isTextAndPersonIframeReady: boolean = false;
  let progressStore: Readable<Progress> = getReadableProgressStore('cycle', {
    regionThreshold: 0.4,
    indicatorSelector: `[data-cycle]`
  });
  let feverGraphicOffset = spring({ x: 0, y: 0 });

  $: progress = $progressStore ? $progressStore.threshold : 0;
  $: clockGraphicProgress = progress ? ((progress * 25) % 10) / 10 : 0;
  $: console.log(clockGraphicProgress);
  $: isClockIframeReady &&
    clockIframeEl.contentWindow &&
    clockIframeEl.contentWindow.postMessage({ type: 'progress', payload: clockGraphicProgress }, '*');
  $: feverGraphicOffset.set({ x: Math.min(progress * 250, 25), y: Math.min(progress * 500, 50) });
  $: feverGraphicProgress = progress ? Math.min(0.5 + progress * 12, 1) : 0.5;
  $: isFeverIframeReady &&
    feverIframeEl.contentWindow &&
    feverIframeEl.contentWindow.postMessage({ type: 'progress', payload: feverGraphicProgress }, '*');
  $: fixedGraphicsOpacity = interpolateFixedGraphicsOpacity(progress);
  $: textAndPersonGraphicProgress = progress ? interpolateTextAndPersonGraphicProgress(progress) : 0;
  $: isTextAndPersonIframeReady &&
    textAndPersonIframeEl.contentWindow &&
    textAndPersonIframeEl.contentWindow.postMessage({ type: 'progress', payload: textAndPersonGraphicProgress }, '*');
</script>

<p class:clips={progress % 1 === 0}>
  <span style={`opacity:${fixedGraphicsOpacity}`}>
    <iframe
      bind:this={clockIframeEl}
      title="Clock Graphic"
      frameBorder="0"
      scrolling="no"
      src={CLOCK_GRAPHIC_PATH}
      on:load={() => (isClockIframeReady = true)}
    />
    <iframe
      bind:this={textAndPersonIframeEl}
      title="Text And Person Graphic"
      frameBorder="0"
      scrolling="no"
      src={TEXT_AND_PERSON_GRAPHIC_PATH}
      on:load={() => (isTextAndPersonIframeReady = true)}
    />
  </span>
  <iframe
    bind:this={feverIframeEl}
    style={`transform:translate(${$feverGraphicOffset.x}vw,${$feverGraphicOffset.y}vh)`}
    title="Fever Graphic"
    frameBorder="0"
    scrolling="no"
    src={FEVER_GRAPHIC_PATH}
    on:load={() => (isFeverIframeReady = true)}
  />
</p>

<!-- svelte-ignore css-unused-selector -->
<style>
  p {
    position: relative;
    padding-bottom: 300em; /* length = duration */
    width: 100%;
  }

  .clips {
    clip: rect(0, auto, auto, 0);
    -webkit-clip-path: inset(0 0 0 0);
    clip-path: inset(0 0 0 0);
  }

  span {
    will-change: opacity;
    opacity: 0;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    z-index: 0;
    position: fixed;
    top: 50%;
    left: 50%;
    display: block;
  }

  iframe {
    transform: translate(-50%, -50%);
    position: absolute;
    top: 0;
    left: 0;
    width: 450px;
    max-width: none;
    height: 450px;
    pointer-events: none;
  }

  @media (min-width: 700px) {
    iframe {
      width: 540px;
      height: 540px;
    }
  }

  p > iframe {
    will-change: transform;
    transform: none;
    top: -6.25em;
    left: -3.25em;
    width: 20em;
    height: 15em;
    transition: transform 0.25s linear;
  }
</style>
