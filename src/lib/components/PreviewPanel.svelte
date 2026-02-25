<script lang="ts">
  import {
    previewData,
    selectedFile,
    status,
    errorMessage,
  } from "../stores/crop-store.js";
</script>

<div class="preview-panel">
  {#if $previewData}
    <img src={$previewData} alt="プレビュー" class="preview-image" />
  {:else if $selectedFile}
    <p class="placeholder">プレビューを読み込み中...</p>
  {:else}
    <p class="placeholder">ファイルを選択するとプレビューが表示されます</p>
  {/if}

  {#if $status === "done"}
    <div class="result-banner success">クロップが完了しました</div>
  {/if}

  {#if $status === "error" && $errorMessage}
    <div class="result-banner error">{$errorMessage}</div>
  {/if}
</div>

<style>
  .preview-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    background: rgba(0, 0, 0, 0.15);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    overflow: hidden;
    position: relative;
  }

  .preview-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .placeholder {
    color: var(--color-text-tertiary);
    font-size: 14px;
  }

  .result-banner {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 8px 12px;
    font-size: 13px;
    text-align: center;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .result-banner.success {
    background: rgba(94, 194, 105, 0.15);
    color: var(--color-success);
  }

  .result-banner.error {
    background: rgba(240, 108, 108, 0.15);
    color: var(--color-error);
    white-space: pre-line;
  }
</style>
