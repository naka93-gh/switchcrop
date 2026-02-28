pub mod commands;
pub mod processor;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            commands::crop_images,
            commands::get_image_info,
            commands::get_preview_data,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
