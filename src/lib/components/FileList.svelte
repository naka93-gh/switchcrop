<script lang="ts">
  import { open } from "@tauri-apps/plugin-dialog";
  import {
    files,
    selectedIndex,
    addFiles,
    removeFile,
    clearFiles,
    selectFile,
  } from "../stores/crop-store.js";

  async function handleAddFiles(): Promise<void> {
    const selected = await open({
      multiple: true,
      filters: [{ name: "画像", extensions: ["jpg", "jpeg", "png", "webp", "bmp", "gif", "tiff", "tif"] }],
    });
    if (selected) {
      const paths = Array.isArray(selected) ? selected : [selected];
      await addFiles(paths);
    }
  }
</script>

<div class="file-list">
  <div class="actions">
    <button onclick={handleAddFiles}>+ ファイル追加</button>
    <button onclick={clearFiles} disabled={$files.length === 0}>× 全削除</button>
  </div>

  <ul class="list">
    {#each $files as file, i}
      <li class:selected={i === $selectedIndex}>
        <button class="file-item" onclick={() => selectFile(i)}>
          <span class="file-name">{file.name}</span>
          {#if file.info}
            <span class="file-size">{file.info.width}×{file.info.height}</span>
          {/if}
        </button>
        <button class="remove-btn" onclick={() => removeFile(i)} title="削除">×</button>
      </li>
    {/each}
  </ul>

  {#if $files.length === 0}
    <p class="empty">ファイルを追加してください</p>
  {/if}
</div>

<style>
  .file-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .actions {
    display: flex;
    gap: 8px;
  }

  .actions button {
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

  .actions button:hover:not(:disabled) {
    background: var(--color-surface-hover);
  }

  .actions button:disabled {
    opacity: 0.35;
    cursor: default;
  }

  .list {
    list-style: none;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    max-height: 200px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.15);
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
    justify-content: space-between;
    align-items: center;
    padding: 6px 8px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    font-size: 13px;
    color: var(--color-text-primary);
  }

  .file-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

  .empty {
    text-align: center;
    color: var(--color-text-tertiary);
    font-size: 13px;
    padding: 16px;
  }
</style>
