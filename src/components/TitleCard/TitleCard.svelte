<script context="module" lang="ts">
  function createLinearScale(domain: [number, number], range: [number, number], clamp = false) {
    return (value: number) => {
      if (domain[0] === domain[1] || range[0] === range[1]) {
        return range[0];
      }

      const ratio = (range[1] - range[0]) / (domain[1] - domain[0]),
        result = range[0] + ratio * (value - domain[0]);
      return clamp ? Math.min(range[1], Math.max(range[0], result)) : result;
    };
  }

  const graphicHorizontalOffsetScale = createLinearScale([0.1, 0.5], [-75, -25], true);
</script>

<script lang="ts">
  import { subscribe } from '@abcnews/progress-utils';
  import type { Progress } from '@abcnews/progress-utils';
  import { onMount } from 'svelte';
  import { spring } from 'svelte/motion';
  import { createSimuation } from './physics';

  let el: HTMLElement;
  let graphicEl: HTMLElement;

  let yOffsetPct = spring(graphicHorizontalOffsetScale(0), {
    stiffness: 0.1,
    damping: 0.8
  });

  onMount(() => {
    const mountEl = el.parentElement;

    if (mountEl) {
      mountEl.classList.add('u-full');
    }

    let hasRun = false;
    const runSimulation = createSimuation(graphicEl);

    return subscribe(
      'titlecard',
      ({ type, data }) => {
        if (type === 'progress') {
          const thresholdProgress = (data as Progress).threshold;

          yOffsetPct.set(graphicHorizontalOffsetScale(thresholdProgress));

          if (!hasRun && thresholdProgress >= 0.05) {
            hasRun = true;
            const stopSimulation = runSimulation();

            setTimeout(stopSimulation, 6000);
          }
        }
      },
      {
        indicatorSelector: '#titlecard',
        regionThreshold: 0
      }
    );
  });
</script>

<div bind:this={el}>
  <figure style={`transform: translate(${$yOffsetPct}%, 0)`} bind:this={graphicEl} />
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
    top: 0;
    left: 50%;
    margin: 0 auto;
    width: 1440px;
    height: 100%;
    transition: transform 0.25s;
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
    height: 12.5%;
  }

  figure::after {
    left: calc(100% - 2px);
    height: 50%;
  }

  figure > :global(canvas) {
    width: 100%;
    height: auto;
  }
</style>
