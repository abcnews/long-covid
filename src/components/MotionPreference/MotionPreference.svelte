<script context="module" lang="ts">
  import { HAS_OPTED_OUT, optOut, optIn } from '.';
</script>

{#if HAS_OPTED_OUT !== null}
  <aside>
    <p>
      {#if HAS_OPTED_OUT}
        You have chosen to view this story without high-motion graphics, but you may <a
          href={undefined}
          on:click={optIn}>re-enable them</a
        >
      {:else}
        This story includes high-motion illustrative elements. If you prefer, you may <a
          href={undefined}
          on:click={optOut}>read the story without them</a
        >
      {/if}
    </p>
  </aside>
{/if}

<style lang="scss">
  aside {
    margin: 0 auto;
    width: 100%;
    max-width: 420px;
    padding: 0 15px;
    color: inherit;
  }

  p {
    border: 1px solid currentColor;
    padding: 10px 15px;
    color: inherit;
    font-family: ABCSans, sans-serif;
    font-size: 0.875rem;
    line-height: 1.5;
    text-align: center;
  }

  a {
    font-weight: bold;
    white-space: nowrap;
    cursor: pointer;
  }
</style>
