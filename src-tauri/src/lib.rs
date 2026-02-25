pub mod commands;
pub mod processor;

use tauri::Manager;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            commands::crop_images,
            commands::get_image_info,
            commands::get_preview_data,
        ])
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            #[cfg(target_os = "macos")]
            {
                use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};
                apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
                    .expect("failed to apply vibrancy");
            }
            let _ = window;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
