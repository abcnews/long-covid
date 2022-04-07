<script context="module" lang="ts">
  import { HAS_OPTED_OUT, optOut, optIn } from '.';
</script>

{#if HAS_OPTED_OUT !== null}
  <aside>
    <p>
      {#if HAS_OPTED_OUT}
        You have chosen to view this story without high-motion graphics or flashing background colour changes, but you
        may <button on:click={optIn}>re-enable them</button>
      {:else}
        This story includes high-motion illustrative elements and background colour changes that flash from light to
        dark. If you prefer, you may <button on:click={optOut}>read the story without them</button>
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

  button {
    font-weight: bold;
    white-space: nowrap;
    cursor: pointer;
    border: none;
    display: inline;
    padding: 0;
    background: none;
    color: currentColor;
    text-decoration: underline;
  }
</style>
