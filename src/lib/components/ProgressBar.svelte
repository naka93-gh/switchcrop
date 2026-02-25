<script lang="ts">
  import { progress, status } from "../stores/crop-store.js";
</script>

{#if $status === "processing" || $status === "done"}
  <div class="progress-bar">
    <div class="track">
      <div
        class="fill"
        class:done={$status === "done"}
        style="width: {$progress * 100}%"
      ></div>
    </div>
    <span class="label">{Math.round($progress * 100)}%</span>
  </div>
{/if}

<style>
  .progress-bar {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .track {
    flex: 1;
    height: 6px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 3px;
    overflow: hidden;
  }

  .fill {
    height: 100%;
    background: var(--color-accent);
    border-radius: 3px;
    transition: width 0.3s ease;
    box-shadow: 0 0 8px rgba(91, 164, 245, 0.4);
  }

  .fill.done {
    background: var(--color-success);
    box-shadow: 0 0 8px rgba(94, 194, 105, 0.4);
  }

  .label {
    font-size: 12px;
    color: var(--color-text-secondary);
    min-width: 36px;
    text-align: right;
  }
</style>
