use image::{DynamicImage, GenericImageView, ImageFormat};
use std::io::Cursor;
use std::path::Path;

/// クロップ設定
#[derive(Debug, Clone, serde::Deserialize)]
pub struct CropSettings {
    pub top: u32,
    pub bottom: u32,
    pub left: u32,
    pub right: u32,
}

/// 画像情報
#[derive(Debug, Clone, serde::Serialize)]
pub struct ImageInfo {
    pub width: u32,
    pub height: u32,
    pub format: String,
}

/// 画像クロップ結果
#[derive(Debug, Clone, serde::Serialize)]
pub struct CropResult {
    pub input_path: String,
    pub output_path: String,
    pub success: bool,
    pub error: Option<String>,
}

/// 画像を読み込んでクロップし、出力パスに保存する
pub fn crop_image(
    input_path: &str,
    output_path: &str,
    settings: &CropSettings,
) -> Result<(), String> {
    let img = image::open(input_path).map_err(|e| format!("画像の読み込みに失敗: {e}"))?;

    let (width, height) = img.dimensions();
    validate_crop_bounds(width, height, settings)?;

    let crop_x = settings.left;
    let crop_y = settings.top;
    let crop_width = width - settings.left - settings.right;
    let crop_height = height - settings.top - settings.bottom;

    let cropped = img.crop_imm(crop_x, crop_y, crop_width, crop_height);

    let format = detect_format(output_path)?;
    cropped
        .save_with_format(output_path, format)
        .map_err(|e| format!("画像の保存に失敗: {e}"))?;

    Ok(())
}

/// 画像のサイズとフォーマット情報を取得する
pub fn get_info(path: &str) -> Result<ImageInfo, String> {
    let img = image::open(path).map_err(|e| format!("画像の読み込みに失敗: {e}"))?;
    let (width, height) = img.dimensions();
    let format = detect_format(path)
        .map(format_to_string)
        .unwrap_or_else(|_| "unknown".to_string());

    Ok(ImageInfo {
        width,
        height,
        format,
    })
}

/// プレビュー用にクロップ済み画像をBase64エンコードしたPNGとして返す
pub fn generate_preview(
    path: &str,
    settings: &CropSettings,
    max_size: u32,
) -> Result<String, String> {
    let img = image::open(path).map_err(|e| format!("画像の読み込みに失敗: {e}"))?;
    let (width, height) = img.dimensions();
    validate_crop_bounds(width, height, settings)?;

    let crop_x = settings.left;
    let crop_y = settings.top;
    let crop_width = width - settings.left - settings.right;
    let crop_height = height - settings.top - settings.bottom;

    let cropped = img.crop_imm(crop_x, crop_y, crop_width, crop_height);
    let resized = resize_for_preview(cropped, max_size);

    let mut buf = Cursor::new(Vec::new());
    resized
        .write_to(&mut buf, ImageFormat::Png)
        .map_err(|e| format!("プレビュー生成に失敗: {e}"))?;

    use base64::Engine;
    let b64 = base64::engine::general_purpose::STANDARD.encode(buf.into_inner());
    Ok(format!("data:image/png;base64,{b64}"))
}

/// クロップ範囲が画像サイズ内に収まるか検証する
fn validate_crop_bounds(width: u32, height: u32, settings: &CropSettings) -> Result<(), String> {
    if settings.left + settings.right >= width {
        return Err(format!(
            "左右のクロップ値の合計({})が画像幅({width})以上です",
            settings.left + settings.right
        ));
    }
    if settings.top + settings.bottom >= height {
        return Err(format!(
            "上下のクロップ値の合計({})が画像高さ({height})以上です",
            settings.top + settings.bottom
        ));
    }
    Ok(())
}

/// ファイル拡張子からImageFormatを判別する
fn detect_format(path: &str) -> Result<ImageFormat, String> {
    let ext = Path::new(path)
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase())
        .unwrap_or_default();

    match ext.as_str() {
        "jpg" | "jpeg" => Ok(ImageFormat::Jpeg),
        "png" => Ok(ImageFormat::Png),
        "webp" => Ok(ImageFormat::WebP),
        "bmp" => Ok(ImageFormat::Bmp),
        "gif" => Ok(ImageFormat::Gif),
        "tiff" | "tif" => Ok(ImageFormat::Tiff),
        _ => Err(format!("未対応の画像形式: {ext}")),
    }
}

/// ImageFormatを文字列に変換する
fn format_to_string(format: ImageFormat) -> String {
    match format {
        ImageFormat::Jpeg => "jpeg",
        ImageFormat::Png => "png",
        ImageFormat::WebP => "webp",
        ImageFormat::Bmp => "bmp",
        ImageFormat::Gif => "gif",
        ImageFormat::Tiff => "tiff",
        _ => "unknown",
    }
    .to_string()
}

/// プレビュー表示用にアスペクト比を保ったままリサイズする
fn resize_for_preview(img: DynamicImage, max_size: u32) -> DynamicImage {
    let (w, h) = img.dimensions();
    if w <= max_size && h <= max_size {
        return img;
    }
    let ratio = (max_size as f64 / w as f64).min(max_size as f64 / h as f64);
    let new_w = (w as f64 * ratio) as u32;
    let new_h = (h as f64 * ratio) as u32;
    DynamicImage::from(image::imageops::resize(
        &img,
        new_w,
        new_h,
        image::imageops::FilterType::Lanczos3,
    ))
}

#[cfg(test)]
mod tests {
    use super::*;
    use image::{ImageBuffer, Rgba};

    fn create_test_image(path: &str, width: u32, height: u32) {
        let img = ImageBuffer::from_fn(width, height, |x, y| {
            Rgba([x as u8, y as u8, 128, 255])
        });
        img.save(path).unwrap();
    }

    #[test]
    fn test_crop_image() {
        let dir = tempfile::tempdir().unwrap();
        let input = dir.path().join("input.png");
        let output = dir.path().join("output.png");
        create_test_image(input.to_str().unwrap(), 100, 80);

        let settings = CropSettings {
            top: 10,
            bottom: 10,
            left: 5,
            right: 5,
        };
        crop_image(input.to_str().unwrap(), output.to_str().unwrap(), &settings).unwrap();

        let result = image::open(&output).unwrap();
        assert_eq!(result.dimensions(), (90, 60));
    }

    #[test]
    fn test_crop_invalid_bounds() {
        let dir = tempfile::tempdir().unwrap();
        let input = dir.path().join("input.png");
        create_test_image(input.to_str().unwrap(), 100, 80);

        let settings = CropSettings {
            top: 50,
            bottom: 50,
            left: 0,
            right: 0,
        };
        let result = crop_image(input.to_str().unwrap(), "out.png", &settings);
        assert!(result.is_err());
    }

    #[test]
    fn test_get_info() {
        let dir = tempfile::tempdir().unwrap();
        let input = dir.path().join("test.png");
        create_test_image(input.to_str().unwrap(), 200, 150);

        let info = get_info(input.to_str().unwrap()).unwrap();
        assert_eq!(info.width, 200);
        assert_eq!(info.height, 150);
        assert_eq!(info.format, "png");
    }

    #[test]
    fn test_generate_preview() {
        let dir = tempfile::tempdir().unwrap();
        let input = dir.path().join("test.png");
        create_test_image(input.to_str().unwrap(), 200, 150);

        let settings = CropSettings {
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
        };
        let data_url = generate_preview(input.to_str().unwrap(), &settings, 100).unwrap();
        assert!(data_url.starts_with("data:image/png;base64,"));
    }
}
