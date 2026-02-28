<script lang="ts">
  import { open } from "@tauri-apps/plugin-dialog";
  import { CROP_PRESETS } from "../presets.js";
  import {
    addFiles,
    assignGroup,
    checkAll,
    checkedPaths,
    clearFiles,
    files,
    groupedFiles,
    removeFile,
    selectedIndex,
    selectFile,
    toggleCheck,
    uncheckAll,
  } from "../stores/crop-store.js";

  let viewMode = $state<"list" | "card">("list");

  /** ファイル選択ダイアログを開いて画像を追加する。 */
  async function handleAddFiles(): Promise<void> {
    const selected = await open({
      multiple: true,
      filters: [
        { name: "画像", extensions: ["jpg", "jpeg", "png", "webp", "bmp", "gif", "tiff", "tif"] },
      ],
    });
    if (selected) {
      const paths = Array.isArray(selected) ? selected : [selected];
      await addFiles(paths);
    }
  }

  /** パスからフラット配列上のインデックスを取得する。 */
  function flatIndex(path: string): number {
    return $files.findIndex((f) => f.path === path);
  }
</script>

<div class="file-list">
  <div class="actions">
    <button onclick={handleAddFiles}>+ ファイル追加</button>
    <button onclick={clearFiles} disabled={$files.length === 0}>× 全削除</button>
    <div class="view-toggle">
      <button
        class:active={viewMode === "list"}
        onclick={() => (viewMode = "list")}
        title="リスト表示"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <rect x="0" y="1" width="14" height="2" rx="0.5" />
          <rect x="0" y="6" width="14" height="2" rx="0.5" />
          <rect x="0" y="11" width="14" height="2" rx="0.5" />
        </svg>
      </button>
      <button
        class:active={viewMode === "card"}
        onclick={() => (viewMode = "card")}
        title="カード表示"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <rect x="0" y="0" width="6" height="6" rx="1" />
          <rect x="8" y="0" width="6" height="6" rx="1" />
          <rect x="0" y="8" width="6" height="6" rx="1" />
          <rect x="8" y="8" width="6" height="6" rx="1" />
        </svg>
      </button>
    </div>
  </div>

  {#if $checkedPaths.size > 0}
    <div class="group-toolbar">
      <span class="toolbar-label">{$checkedPaths.size}件選択:</span>
      {#each CROP_PRESETS as preset (preset.id)}
        <button class="toolbar-btn" onclick={() => assignGroup(preset.id)}>
          {preset.label}
        </button>
      {/each}
      <button class="toolbar-btn toolbar-btn--muted" onclick={() => assignGroup(null)}>
        未分類に戻す
      </button>
      <div class="toolbar-spacer"></div>
      <button class="toolbar-btn toolbar-btn--muted" onclick={uncheckAll}>解除</button>
    </div>
  {:else if $files.length > 0}
    <div class="group-toolbar">
      <button class="toolbar-btn toolbar-btn--muted" onclick={checkAll}>全選択</button>
    </div>
  {/if}

  <div class="file-content">
    {#each $groupedFiles as group (group.id ?? "__ungrouped")}
      <div class="group-section">
        <div class="group-header">
          {group.label} ({group.files.length})
        </div>

        {#if viewMode === "list"}
          <ul class="list">
            {#each group.files as file (file.path)}
              {@const idx = flatIndex(file.path)}
              <li class:selected={idx === $selectedIndex}>
                <input
                  type="checkbox"
                  class="check"
                  checked={$checkedPaths.has(file.path)}
                  onclick={(e: MouseEvent) => e.stopPropagation()}
                  onchange={() => toggleCheck(file.path)}
                />
                <button class="file-item" onclick={() => selectFile(idx)}>
                  {#if file.thumbnailUrl}
                    <img class="thumbnail-list" src={file.thumbnailUrl} alt="" />
                  {:else}
                    <span class="thumbnail-placeholder-list"></span>
                  {/if}
                  <span class="file-name">{file.name}</span>
                  {#if file.info}
                    <span class="file-size">{file.info.width}×{file.info.height}</span>
                  {/if}
                </button>
                <button class="remove-btn" onclick={() => removeFile(idx)} title="削除">×</button>
              </li>
            {/each}
          </ul>
        {:else}
          <div class="card-grid">
            {#each group.files as file (file.path)}
              {@const idx = flatIndex(file.path)}
              <div
                class="card-item"
                class:selected={idx === $selectedIndex}
                role="button"
                tabindex="0"
                onclick={() => selectFile(idx)}
                onkeydown={(e: KeyboardEvent) => {
                  if (e.key === "Enter" || e.key === " ") selectFile(idx);
                }}
                title={file.name}
              >
                <input
                  type="checkbox"
                  class="check check-card"
                  checked={$checkedPaths.has(file.path)}
                  onclick={(e: MouseEvent) => e.stopPropagation()}
                  onchange={() => toggleCheck(file.path)}
                />
                {#if file.thumbnailUrl}
                  <img class="thumbnail-card" src={file.thumbnailUrl} alt={file.name} />
                {:else}
                  <span class="thumbnail-placeholder-card"></span>
                {/if}
                <button
                  class="remove-btn-card"
                  onclick={(e: MouseEvent) => {
                    e.stopPropagation();
                    removeFile(idx);
                  }}
                  title="削除">×</button
                >
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>

  {#if $files.length === 0}
    <p class="empty">ファイルを追加してください</p>
  {/if}
</div>

<style>
  .file-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    min-height: 0;
  }

  .actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .actions > button {
    flex: 1;
    padding: 6px 12px;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: var(--color-surface);
    color: var(--color-text-primary);
    cursor: pointer;
    font-size: 13px;
    transition: background 0.15s;
  }

  .actions > button:hover:not(:disabled) {
    background: var(--color-surface-hover);
  }

  .actions > button:disabled {
    opacity: 0.35;
    cursor: default;
  }

  .view-toggle {
    display: flex;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    overflow: hidden;
    flex-shrink: 0;
  }

  .view-toggle button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border: none;
    background: var(--color-surface);
    color: var(--color-text-tertiary);
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s;
  }

  .view-toggle button:first-child {
    border-right: 1px solid var(--color-border);
  }

  .view-toggle button:hover {
    background: var(--color-surface-hover);
  }

  .view-toggle button.active {
    background: var(--color-surface-selected);
    color: var(--color-accent);
  }

  /* --- グループツールバー --- */

  .group-toolbar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: var(--color-surface);
    font-size: 12px;
    flex-wrap: wrap;
  }

  .toolbar-label {
    color: var(--color-text-secondary);
    font-weight: 500;
    flex-shrink: 0;
  }

  .toolbar-btn {
    padding: 2px 10px;
    border: 1px solid var(--color-accent);
    border-radius: 4px;
    background: transparent;
    color: var(--color-accent);
    font-size: 12px;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .toolbar-btn:hover {
    opacity: 0.75;
  }

  .toolbar-btn--muted {
    border-color: var(--color-border);
    color: var(--color-text-secondary);
  }

  .toolbar-spacer {
    flex: 1;
  }

  /* --- ファイルコンテンツ（スクロール領域） --- */

  .file-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  /* --- グループセクション --- */

  .group-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .group-header {
    font-size: 12px;
    font-weight: 600;
    color: var(--color-text-secondary);
    padding: 2px 4px;
  }

  /* --- チェックボックス --- */

  .check {
    flex-shrink: 0;
    margin: 0 0 0 8px;
    cursor: pointer;
  }

  .check-card {
    position: absolute;
    top: 4px;
    left: 4px;
    margin: 0;
    z-index: 1;
  }

  /* --- リスト表示 --- */

  .list {
    list-style: none;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: var(--color-surface);
  }

  .list li {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--color-border-subtle);
    transition: background 0.12s;
  }

  .list li:last-child {
    border-bottom: none;
  }

  .list li:hover {
    background: var(--color-surface-hover);
  }

  .list li.selected {
    background: var(--color-surface-selected);
  }

  .file-item {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    font-size: 13px;
    color: var(--color-text-primary);
  }

  .thumbnail-list {
    width: 32px;
    height: 32px;
    object-fit: contain;
    border-radius: 3px;
    flex-shrink: 0;
    background: var(--color-bg);
  }

  .thumbnail-placeholder-list {
    display: block;
    width: 32px;
    height: 32px;
    border-radius: 3px;
    flex-shrink: 0;
    background: var(--color-border-subtle);
  }

  .file-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }

  .file-size {
    color: var(--color-text-secondary);
    font-size: 11px;
    margin-left: 8px;
    flex-shrink: 0;
  }

  .remove-btn {
    background: none;
    border: none;
    color: var(--color-text-tertiary);
    cursor: pointer;
    padding: 4px 8px;
    font-size: 14px;
    transition: color 0.15s;
  }

  .remove-btn:hover {
    color: var(--color-error);
  }

  /* --- カード表示 --- */

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 6px;
    padding: 6px;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: var(--color-surface);
    align-content: start;
  }

  .card-item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1;
    border: 2px solid transparent;
    border-radius: 6px;
    background: var(--color-bg);
    cursor: pointer;
    padding: 4px;
    transition: border-color 0.15s;
  }

  .card-item:hover {
    border-color: var(--color-border);
  }

  .card-item.selected {
    border-color: var(--color-accent);
  }

  .thumbnail-card {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 3px;
  }

  .thumbnail-placeholder-card {
    display: block;
    width: 40px;
    height: 40px;
    border-radius: 3px;
    background: var(--color-border-subtle);
  }

  .remove-btn-card {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    font-size: 11px;
    line-height: 1;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.15s;
  }

  .card-item:hover .remove-btn-card {
    opacity: 1;
  }

  .remove-btn-card:hover {
    background: var(--color-error);
  }

  .empty {
    text-align: center;
    color: var(--color-text-tertiary);
    font-size: 13px;
    padding: 16px;
  }
</style>
