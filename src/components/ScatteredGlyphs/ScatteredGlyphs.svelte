<script lang="ts">
  import { getReadableProgressStore } from '@abcnews/progress-utils';
  import type { Progress } from '@abcnews/progress-utils';
  import { onMount } from 'svelte';
  import type { Readable } from 'svelte/store';

  export let mountIndex: number;

  let progressStore: Readable<Progress> = getReadableProgressStore(`scatteredglyphs_${mountIndex}`, {
    indicatorSelector: `[data-scatteredglyphs="${mountIndex}"]`,
    regionTop: 0.2,
    regionBottom: 0.8
  });
  let el: HTMLElement;
  let parentNextElementSibling: Element | null | undefined;
  let text: string = '';

  $: progress = $progressStore ? $progressStore.region : 0;
  $: transparency = Math.abs(-1 + 2 * progress);

  onMount(() => {
    parentNextElementSibling = el.parentElement?.nextElementSibling;

    if (parentNextElementSibling) {
      text = parentNextElementSibling.textContent || '';
    }
  });
</script>

<div bind:this={el} style={`opacity:${1 - transparency};`}>{text}</div>

<style>
  div {
    font-family: inherit;
    color: red;
  }

  @media (min-width: 700px) {
    div {
      color: orange;
    }
  }
</style>
