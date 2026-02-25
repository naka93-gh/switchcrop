# Cropper

画像をクロップするためのデスクトップアプリ

## 概要

Cropperは、画像（JPG, PNG, WebP, BMP, GIF, TIFF）から指定したピクセル数を上下左右から除去するツールです。
Tauri v2 + Svelte 5 で構築されたデスクトップアプリケーションで、バッチ処理にも対応しています。

## 機能

- 上下左右のクロップピクセル数を個別に指定
- 複数ファイルの一括処理（バッチ処理）
- クロップ後のリアルタイムプレビュー

## 技術スタック

- **Tauri v2** — デスクトップアプリフレームワーク
- **Svelte 5** — フロントエンドUI
- **TypeScript** — フロントエンド言語
- **Rust** — バックエンド画像処理

## 必要環境

- Node.js
- Rust
- Tauri v2 の[前提条件](https://v2.tauri.app/start/prerequisites/)

## セットアップ

```bash
npm install
```

## 使用方法

```bash
npm run tauri dev
```

## 開発

```bash
# フロントエンドテスト
npx vitest run

# Rustテスト
cd src-tauri && cargo test

# プロダクションビルド
npm run tauri build
```

## ライセンス

TBD
