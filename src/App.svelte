<script lang="ts">
  import FileList from "./lib/components/FileList.svelte";
  import CropPanel from "./lib/components/CropPanel.svelte";
  import PreviewPanel from "./lib/components/PreviewPanel.svelte";
  import ProgressBar from "./lib/components/ProgressBar.svelte";
  import { selectedIndex, requestPreview } from "./lib/stores/crop-store.js";

  $effect(() => {
    void $selectedIndex;
    requestPreview();
  });
</script>

<div class="app">
  <header>
    <h1>Cropper</h1>
  </header>

  <div class="content">
    <aside class="sidebar">
      <FileList />
      <CropPanel />
      <ProgressBar />
    </aside>
    <main class="main">
      <PreviewPanel />
    </main>
  </div>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: transparent;
  }

  header {
    padding: 8px 16px;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    -webkit-app-region: drag;
  }

  header h1 {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
    letter-spacing: 0.02em;
  }

  .content {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .sidebar {
    width: 300px;
    min-width: 300px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
    border-right: 1px solid var(--color-border);
    background: rgba(20, 20, 20, 0.4);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .main {
    flex: 1;
    padding: 12px;
    background: transparent;
  }
</style>
