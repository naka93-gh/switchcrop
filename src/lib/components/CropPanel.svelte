<script lang="ts">
  import { CROP_PRESETS } from "../presets.js";
  import {
    cropSettings,
    croppedSize,
    executeCrop,
    files,
    selectedFile,
    status,
  } from "../stores/crop-store.js";
  import type { CropPreset } from "../types/index.js";

  /** クロップ値の入力ハンドラー。 */
  function handleInput(side: "top" | "bottom" | "left" | "right", event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = Math.max(0, parseInt(target.value) || 0);
    cropSettings.update((s) => ({ ...s, [side]: value }));
  }

  /** プリセットの適用。 */
  function applyPreset(preset: CropPreset): void {
    cropSettings.set({ ...preset.settings });
  }

  /** 選択中画像のサイズに一致するプリセット一覧。 */
  const matchingPresets = $derived(
    CROP_PRESETS.filter((p) => {
      const info = $selectedFile?.info;
      return info && p.sourceWidth === info.width && p.sourceHeight === info.height;
    }),
  );
</script>

<div class="crop-panel">
  <div class="settings">
    {#each [{ key: "top" as const, label: "上" }, { key: "bottom" as const, label: "下" }, { key: "left" as const, label: "左" }, { key: "right" as const, label: "右" }] as { key, label } (key)}
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

  {#if matchingPresets.length > 0}
    <div class="presets">
      {#each matchingPresets as preset (preset.label)}
        <button class="preset-btn" onclick={() => applyPreset(preset)}>
          {preset.label}
        </button>
      {/each}
    </div>
  {/if}

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

  .presets {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .preset-btn {
    padding: 4px 12px;
    background: transparent;
    color: var(--color-accent);
    border: 1px solid var(--color-accent);
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: opacity 0.15s;
  }

  .preset-btn:hover {
    opacity: 0.85;
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
