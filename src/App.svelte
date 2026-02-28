<script lang="ts">
  import { getCurrentWebview } from "@tauri-apps/api/webview";
  import CropPanel from "./lib/components/CropPanel.svelte";
  import FileList from "./lib/components/FileList.svelte";
  import PreviewPanel from "./lib/components/PreviewPanel.svelte";
  import ProgressBar from "./lib/components/ProgressBar.svelte";
  import { addFiles, selectedIndex, updateOriginalImageUrl } from "./lib/stores/crop-store.js";

  const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "bmp", "gif", "tiff", "tif"]);

  type Tab = "files" | "crop";
  let activeTab: Tab = $state("files");
  let isDragging = $state(false);

  function filterImagePaths(paths: string[]): string[] {
    return paths.filter((p) => {
      const ext = p.split(".").pop()?.toLowerCase() ?? "";
      return IMAGE_EXTENSIONS.has(ext);
    });
  }

  $effect(() => {
    void $selectedIndex;
    updateOriginalImageUrl();
  });

  $effect(() => {
    const unlisten = getCurrentWebview().onDragDropEvent((event) => {
      if (event.payload.type === "enter") {
        isDragging = true;
      } else if (event.payload.type === "drop") {
        isDragging = false;
        const imagePaths = filterImagePaths(event.payload.paths);
        if (imagePaths.length > 0) {
          activeTab = "files";
          addFiles(imagePaths);
        }
      } else if (event.payload.type === "leave") {
        isDragging = false;
      }
    });
    return () => { unlisten.then((fn) => fn()); };
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

  {#if isDragging}
    <div class="drop-overlay">
      <div class="drop-message">ここにドロップして追加</div>
    </div>
  {/if}

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

  .drop-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 122, 255, 0.08);
    border: 3px dashed var(--color-accent);
    pointer-events: none;
  }

  .drop-message {
    padding: 12px 24px;
    border-radius: 10px;
    background: var(--color-accent);
    color: #fff;
    font-size: 15px;
    font-weight: 600;
  }
</style>
