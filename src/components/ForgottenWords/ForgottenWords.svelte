<script lang="ts">
  import { getReadableProgressStore } from '@abcnews/progress-utils';
  import type { Progress } from '@abcnews/progress-utils';
  import { onMount } from 'svelte';
  import type { Readable } from 'svelte/store';

  export let mountIndex: number;
  export let numWordsToHide: number = 6;

  let progressStore: Readable<Progress> = getReadableProgressStore(`forgottenwords_${mountIndex}`, {
    indicatorSelector: `[data-forgottenwords="${mountIndex}"]`,
    regionTop: 0.3,
    regionBottom: 0.5
  });
  let el: HTMLElement;
  let parentNextElementSibling: Element | null | undefined;
  let words: string[] = [];

  $: progress = $progressStore ? $progressStore.region : 0;
  $: numVisibleWords = words.length - Math.floor(progress * numWordsToHide);

  onMount(() => {
    parentNextElementSibling = el.parentElement?.nextElementSibling;

    if (parentNextElementSibling) {
      words = (parentNextElementSibling.textContent || '').split(/\s+/).filter(x => x.trim().length > 0);
    }
  });
</script>

<p bind:this={el}>
  {#each words as word, index}
    <span class:forgotten={index + 1 > numVisibleWords}>{word}</span>
  {/each}
</p>

<style>
  p {
    font-family: inherit;
    font-size: 1.125rem;
    line-height: 1.555555556;
  }

  @media (min-width: 700px) {
    p {
      line-height: 1.666666667;
    }
  }

  span {
    position: relative;
    display: inline-block;
    transition: opacity 0.75s, transform 0.75s;
  }

  span.forgotten {
    opacity: 0;
    transform: rotate(3deg) translate(0, 0.33em);
  }

  span:not(:last-child) {
    margin-right: 0.5ch;
  }
</style>
