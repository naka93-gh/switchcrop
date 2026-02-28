import { readFile } from "@tauri-apps/plugin-fs";
import { derived, get, writable } from "svelte/store";
import {
  cropImages,
  getImageInfo,
  getPreviewData,
} from "../commands/crop-commands.js";
import type {
  CropResult,
  CropSettings,
  FileEntry,
  ProcessingStatus,
} from "../types/index.js";

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

/** 元画像の Object URL */
export const originalImageUrl = writable<string>("");

/** エラーメッセージ */
export const errorMessage = writable<string>("");

/** 選択中のファイルエントリ */
export const selectedFile = derived([files, selectedIndex], ([$files, $idx]) =>
  $idx >= 0 && $idx < $files.length ? $files[$idx] : null,
);

/** クロップ後の画像サイズ */
export const croppedSize = derived(
  [selectedFile, cropSettings],
  ([$file, $settings]): { width: number; height: number } | null => {
    if (!$file?.info) return null;
    const width = $file.info.width - $settings.left - $settings.right;
    const height = $file.info.height - $settings.top - $settings.bottom;
    return { width: Math.max(0, width), height: Math.max(0, height) };
  },
);

const THUMBNAIL_CROP: CropSettings = { top: 0, bottom: 0, left: 0, right: 0 };
const THUMBNAIL_SIZE = 80;

/** 1ファイル分の情報とサムネイルを並列取得する */
async function loadFileEntry(path: string): Promise<FileEntry> {
  const name = path.split("/").pop() ?? path.split("\\").pop() ?? path;
  const [infoResult, thumbResult] = await Promise.allSettled([
    getImageInfo(path),
    getPreviewData(path, THUMBNAIL_CROP, THUMBNAIL_SIZE),
  ]);
  return {
    path,
    name,
    info: infoResult.status === "fulfilled" ? infoResult.value : null,
    thumbnailUrl: thumbResult.status === "fulfilled" ? thumbResult.value : "",
  };
}

/** ファイルを追加し、画像情報とサムネイルを並列取得する */
export async function addFiles(paths: string[]): Promise<void> {
  const newEntries = await Promise.all(paths.map(loadFileEntry));
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
  const prev = get(originalImageUrl);
  if (prev) URL.revokeObjectURL(prev);
  files.set([]);
  selectedIndex.set(-1);
  originalImageUrl.set("");
}

/** ファイルを選択する */
export function selectFile(index: number): void {
  selectedIndex.set(index);
}

/** 選択中ファイルの Object URL を更新する */
export async function updateOriginalImageUrl(): Promise<void> {
  const prev = get(originalImageUrl);
  if (prev) URL.revokeObjectURL(prev);

  const file = get(selectedFile);
  if (!file) {
    originalImageUrl.set("");
    return;
  }
  try {
    const bytes = await readFile(file.path);
    const blob = new Blob([bytes]);
    originalImageUrl.set(URL.createObjectURL(blob));
  } catch {
    originalImageUrl.set("");
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
