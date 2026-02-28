<script lang="ts">
  import CropPanel from "./lib/components/CropPanel.svelte";
  import FileList from "./lib/components/FileList.svelte";
  import PreviewPanel from "./lib/components/PreviewPanel.svelte";
  import ProgressBar from "./lib/components/ProgressBar.svelte";
  import { selectedIndex, updateOriginalImageUrl } from "./lib/stores/crop-store.js";

  type Tab = "files" | "crop";
  let activeTab: Tab = $state("files");

  $effect(() => {
    void $selectedIndex;
    updateOriginalImageUrl();
  });
</script>

<div class="app">
  <header>
    <h1>Cropper</h1>
    <nav class="tabs">
      <button
        class="tab"
        class:active={activeTab === "files"}
        onclick={() => (activeTab = "files")}
      >
        ファイル
      </button>
      <button
        class="tab"
        class:active={activeTab === "crop"}
        onclick={() => (activeTab = "crop")}
      >
        クロップ
      </button>
    </nav>
  </header>

  {#if activeTab === "files"}
    <div class="tab-content files-tab">
      <FileList />
    </div>
  {:else}
    <div class="tab-content crop-tab">
      <div class="preview-area">
        <PreviewPanel />
      </div>
      <div class="controls">
        <CropPanel />
        <ProgressBar />
      </div>
    </div>
  {/if}
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--color-bg);
  }

  header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 8px 16px;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface);
    -webkit-app-region: drag;
  }

  header h1 {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
    letter-spacing: 0.02em;
  }

  .tabs {
    display: flex;
    gap: 4px;
    -webkit-app-region: no-drag;
  }

  .tab {
    padding: 4px 12px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--color-text-secondary);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }

  .tab:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  .tab.active {
    background: var(--color-accent);
    color: #ffffff;
  }

  .tab-content {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .files-tab {
    padding: 12px;
  }

  .crop-tab {
    padding: 12px;
    gap: 12px;
  }

  .preview-area {
    flex: 1;
    min-height: 0;
  }

  .controls {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
</style>
