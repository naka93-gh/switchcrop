import { writable, derived, get } from "svelte/store";
import type {
  CropSettings,
  FileEntry,
  CropResult,
  ProcessingStatus,
} from "../types/index.js";
import {
  cropImages,
  getImageInfo,
  getPreviewData,
} from "../commands/crop-commands.js";

/** ファイルリスト */
export const files = writable<FileEntry[]>([]);

/** 選択中ファイルのインデックス */
export const selectedIndex = writable<number>(-1);

/** クロップ設定 */
export const cropSettings = writable<CropSettings>({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
});

/** 処理状態 */
export const status = writable<ProcessingStatus>("idle");

/** 処理進捗（0〜1） */
export const progress = writable<number>(0);

/** クロップ結果 */
export const results = writable<CropResult[]>([]);

/** プレビュー画像データURL */
export const previewData = writable<string>("");

/** エラーメッセージ */
export const errorMessage = writable<string>("");

/** 選択中のファイルエントリ */
export const selectedFile = derived(
  [files, selectedIndex],
  ([$files, $idx]) => ($idx >= 0 && $idx < $files.length ? $files[$idx] : null),
);

/** ファイルを追加し、画像情報を取得する */
export async function addFiles(paths: string[]): Promise<void> {
  const newEntries: FileEntry[] = [];
  for (const path of paths) {
    const name = path.split("/").pop() ?? path.split("\\").pop() ?? path;
    try {
      const info = await getImageInfo(path);
      newEntries.push({ path, name, info });
    } catch {
      newEntries.push({ path, name, info: null });
    }
  }
  files.update((current) => [...current, ...newEntries]);
  if (get(selectedIndex) < 0 && newEntries.length > 0) {
    selectedIndex.set(0);
  }
}

/** ファイルリストから指定インデックスのファイルを削除する */
export function removeFile(index: number): void {
  files.update((current) => current.filter((_, i) => i !== index));
  const currentFiles = get(files);
  if (currentFiles.length === 0) {
    selectedIndex.set(-1);
  } else {
    const idx = get(selectedIndex);
    if (idx >= currentFiles.length) {
      selectedIndex.set(currentFiles.length - 1);
    }
  }
}

/** 全ファイルを削除する */
export function clearFiles(): void {
  files.set([]);
  selectedIndex.set(-1);
  previewData.set("");
}

/** ファイルを選択する */
export function selectFile(index: number): void {
  selectedIndex.set(index);
}

let previewTimer: ReturnType<typeof setTimeout> | null = null;

/** プレビューを更新する（300msデバウンス） */
export function requestPreview(): void {
  if (previewTimer) clearTimeout(previewTimer);
  previewTimer = setTimeout(() => {
    void doUpdatePreview();
  }, 300);
}

/** プレビューを即座に更新する */
async function doUpdatePreview(): Promise<void> {
  const file = get(selectedFile);
  if (!file) {
    previewData.set("");
    return;
  }
  try {
    const data = await getPreviewData(file.path, get(cropSettings));
    previewData.set(data);
  } catch (e) {
    previewData.set("");
    errorMessage.set(String(e));
  }
}

/** クロップを実行する */
export async function executeCrop(): Promise<void> {
  const currentFiles = get(files);
  if (currentFiles.length === 0) return;

  status.set("processing");
  progress.set(0);
  results.set([]);
  errorMessage.set("");

  try {
    const paths = currentFiles.map((f) => f.path);
    const settings = get(cropSettings);
    const cropResults = await cropImages(paths, settings);
    results.set(cropResults);
    progress.set(1);
    const hasError = cropResults.some((r) => !r.success);
    status.set(hasError ? "error" : "done");
    if (hasError) {
      const errors = cropResults
        .filter((r) => !r.success)
        .map((r) => `${r.input_path}: ${r.error}`)
        .join("\n");
      errorMessage.set(errors);
    }
  } catch (e) {
    status.set("error");
    errorMessage.set(String(e));
  }
}
