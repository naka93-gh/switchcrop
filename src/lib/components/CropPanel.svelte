<script lang="ts">
  import {
    cropSettings,
    croppedSize,
    executeCrop,
    files,
    selectedFile,
    status,
  } from "../stores/crop-store.js";

  function handleInput(
    side: "top" | "bottom" | "left" | "right",
    event: Event,
  ): void {
    const target = event.target as HTMLInputElement;
    const value = Math.max(0, parseInt(target.value) || 0);
    cropSettings.update((s) => ({ ...s, [side]: value }));
  }
</script>

<div class="crop-panel">
  <div class="settings">
    {#each [
      { key: "top" as const, label: "上" },
      { key: "bottom" as const, label: "下" },
      { key: "left" as const, label: "左" },
      { key: "right" as const, label: "右" },
    ] as { key, label }}
      <label class="setting-item">
        <span class="label">{label}</span>
        <input
          type="number"
          min="0"
          value={$cropSettings[key]}
          oninput={(e) => handleInput(key, e)}
        />
        <span class="unit">px</span>
      </label>
    {/each}
  </div>

  {#if $selectedFile?.info && $croppedSize}
    <div class="size-info">
      <span class="original">{$selectedFile.info.width} x {$selectedFile.info.height}</span>
      <span class="arrow">&rarr;</span>
      <span class="cropped" class:invalid={$croppedSize.width <= 0 || $croppedSize.height <= 0}>
        {$croppedSize.width} x {$croppedSize.height}
      </span>
    </div>
  {/if}

  <button
    class="execute-btn"
    onclick={executeCrop}
    disabled={$files.length === 0 || $status === "processing"}
  >
    {$status === "processing" ? "処理中..." : "クロップ実行"}
  </button>
</div>

<style>
  .crop-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .settings {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .setting-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .label {
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  input[type="number"] {
    width: 100%;
    min-width: 0;
    padding: 4px 8px;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    font-size: 13px;
    text-align: right;
    background: var(--color-surface);
    color: var(--color-text-primary);
    transition: border-color 0.15s;
  }

  input[type="number"]:focus {
    outline: none;
    border-color: var(--color-accent);
  }

  .unit {
    font-size: 12px;
    color: var(--color-text-tertiary);
  }

  .size-info {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--color-text-secondary);
    padding: 6px 8px;
    background: var(--color-surface);
    border: 1px solid var(--color-border-subtle);
    border-radius: 6px;
  }

  .arrow {
    color: var(--color-text-tertiary);
  }

  .cropped {
    color: var(--color-accent);
    font-weight: 500;
  }

  .cropped.invalid {
    color: var(--color-error);
  }

  .execute-btn {
    padding: 10px 16px;
    background: var(--color-accent);
    color: #ffffff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: opacity 0.15s;
  }

  .execute-btn:hover:not(:disabled) {
    opacity: 0.85;
  }

  .execute-btn:disabled {
    opacity: 0.35;
    cursor: default;
  }
</style>
