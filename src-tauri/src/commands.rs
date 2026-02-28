use crate::processor::{self, CropResult, CropSettings, ImageInfo};
use std::path::{Path, PathBuf};

/// 複数画像を一括クロップする
#[tauri::command]
pub async fn crop_images(
    paths: Vec<String>,
    settings: CropSettings,
    output_dir: Option<String>,
) -> Result<Vec<CropResult>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        paths
            .iter()
            .map(|path| crop_single(path, &settings, output_dir.as_deref()))
            .collect()
    })
    .await
    .map_err(|e| format!("タスク実行エラー: {e}"))
}

/// 画像のサイズ・フォーマット情報を取得する
#[tauri::command]
pub async fn get_image_info(path: String) -> Result<ImageInfo, String> {
    tauri::async_runtime::spawn_blocking(move || processor::get_info(&path))
        .await
        .map_err(|e| format!("タスク実行エラー: {e}"))?
}

/// プレビュー用Base64画像データを生成する
#[tauri::command]
pub async fn get_preview_data(
    path: String,
    settings: CropSettings,
    max_size: Option<u32>,
) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let max = max_size.unwrap_or(600);
        processor::generate_preview(&path, &settings, max)
    })
    .await
    .map_err(|e| format!("タスク実行エラー: {e}"))?
}

/// 単一画像をクロップして結果を返す
fn crop_single(path: &str, settings: &CropSettings, output_dir: Option<&str>) -> CropResult {
    let output_path = build_output_path(path, output_dir);
    let output_str = output_path.to_string_lossy().to_string();

    match processor::crop_image(path, &output_str, settings) {
        Ok(()) => CropResult {
            input_path: path.to_string(),
            output_path: output_str,
            success: true,
            error: None,
        },
        Err(e) => CropResult {
            input_path: path.to_string(),
            output_path: output_str,
            success: false,
            error: Some(e),
        },
    }
}

/// 出力ファイルパスを生成する（元ファイル名に_croppedを付与）
fn build_output_path(input_path: &str, output_dir: Option<&str>) -> PathBuf {
    let input = Path::new(input_path);
    let stem = input.file_stem().unwrap_or_default().to_string_lossy();
    let ext = input.extension().unwrap_or_default().to_string_lossy();
    let filename = format!("{stem}_cropped.{ext}");

    match output_dir {
        Some(dir) => Path::new(dir).join(filename),
        None => input.parent().unwrap_or(Path::new(".")).join(filename),
    }
}
