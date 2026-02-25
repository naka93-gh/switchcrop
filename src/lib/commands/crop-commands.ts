import { invoke } from "@tauri-apps/api/core";
import type { CropResult, CropSettings, ImageInfo } from "../types/index.js";

/** 複数画像を一括クロップする */
export async function cropImages(
  paths: string[],
  settings: CropSettings,
  outputDir?: string,
): Promise<CropResult[]> {
  return invoke<CropResult[]>("crop_images", {
    paths,
    settings,
    outputDir: outputDir ?? null,
  });
}

/** 画像のサイズ・フォーマット情報を取得する */
export async function getImageInfo(path: string): Promise<ImageInfo> {
  return invoke<ImageInfo>("get_image_info", { path });
}

/** プレビュー用Base64画像データを取得する */
export async function getPreviewData(
  path: string,
  settings: CropSettings,
  maxSize?: number,
): Promise<string> {
  return invoke<string>("get_preview_data", {
    path,
    settings,
    maxSize: maxSize ?? null,
  });
}
