<script lang="ts">
  import {
    cropSettings,
    status,
    files,
    executeCrop,
    requestPreview,
  } from "../stores/crop-store.js";

  function handleInput(
    side: "top" | "bottom" | "left" | "right",
    event: Event,
  ): void {
    const target = event.target as HTMLInputElement;
    const value = Math.max(0, parseInt(target.value) || 0);
    cropSettings.update((s) => ({ ...s, [side]: value }));
    requestPreview();
  }
</script>

<div class="crop-panel">
  <h3>クロップ設定</h3>

  <div class="settings">
    {#each [
      { key: "top" as const, label: "上" },
      { key: "bottom" as const, label: "下" },
      { key: "left" as const, label: "左" },
      { key: "right" as const, label: "右" },
    ] as { key, label }}
      <label class="setting-row">
        <span class="label">{label}:</span>
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

  h3 {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-secondary);
    border-bottom: 1px solid var(--color-border-subtle);
    padding-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .settings {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .setting-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .label {
    width: 24px;
    text-align: right;
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  input[type="number"] {
    width: 80px;
    padding: 4px 8px;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    font-size: 13px;
    text-align: right;
    background: rgba(0, 0, 0, 0.2);
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

  .execute-btn {
    padding: 10px 16px;
    background: var(--color-accent);
    color: #fff;
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
