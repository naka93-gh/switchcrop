import type { CropPreset } from "./types/index.js";

/**
 * Switch スクリーンショット (1280x720) 向けクロップのプリセット。
 * TODO: GCとGBA以外の場合のプリセット作成
 */
export const CROP_PRESETS: CropPreset[] = [
  // ゲームキューブ
  {
    label: "GC",
    sourceWidth: 1920,
    sourceHeight: 1080,
    settings: { top: 0, bottom: 60, left: 280, right: 280 },
  },
  // ゲームボーイアドバンス
  {
    label: "GBA",
    sourceWidth: 1280,
    sourceHeight: 720,
    settings: { top: 22, bottom: 58, left: 160, right: 160 },
  },
];
