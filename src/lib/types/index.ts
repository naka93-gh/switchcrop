/** クロップ設定（上下左右の除去ピクセル数） */
export interface CropSettings {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/** 画像情報 */
export interface ImageInfo {
  width: number;
  height: number;
  format: string;
}

/** ファイルエントリ（UIで管理する1ファイルの情報） */
export interface FileEntry {
  path: string;
  name: string;
  info: ImageInfo | null;
}

/** クロップ結果 */
export interface CropResult {
  input_path: string;
  output_path: string;
  success: boolean;
  error: string | null;
}

/** 処理の進捗状態 */
export type ProcessingStatus = "idle" | "processing" | "done" | "error";
