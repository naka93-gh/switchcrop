import { describe, it, expect, vi, beforeEach } from "vitest";
import { get } from "svelte/store";
import { invoke } from "@tauri-apps/api/core";
import {
  files,
  selectedIndex,
  cropSettings,
  status,
  progress,
  selectedFile,
  addFiles,
  removeFile,
  clearFiles,
  selectFile,
  executeCrop,
} from "../src/lib/stores/crop-store.js";

const mockInvoke = vi.mocked(invoke);

beforeEach(() => {
  clearFiles();
  cropSettings.set({ top: 0, bottom: 0, left: 0, right: 0 });
  status.set("idle");
  progress.set(0);
  vi.clearAllMocks();
});

describe("crop-store", () => {
  describe("addFiles", () => {
    it("ファイルを追加し画像情報を取得する", async () => {
      mockInvoke.mockResolvedValueOnce({ width: 100, height: 200, format: "png" });
      await addFiles(["/path/to/image.png"]);

      const fileList = get(files);
      expect(fileList).toHaveLength(1);
      expect(fileList[0].name).toBe("image.png");
      expect(fileList[0].info).toEqual({ width: 100, height: 200, format: "png" });
    });

    it("最初のファイル追加時にインデックス0が選択される", async () => {
      mockInvoke.mockResolvedValueOnce({ width: 100, height: 200, format: "png" });
      await addFiles(["/path/to/image.png"]);
      expect(get(selectedIndex)).toBe(0);
    });

    it("画像情報取得に失敗してもファイルは追加される", async () => {
      mockInvoke.mockRejectedValueOnce(new Error("読み込み失敗"));
      await addFiles(["/path/to/bad.png"]);

      const fileList = get(files);
      expect(fileList).toHaveLength(1);
      expect(fileList[0].info).toBeNull();
    });
  });

  describe("removeFile", () => {
    it("指定インデックスのファイルを削除する", async () => {
      mockInvoke.mockResolvedValue({ width: 10, height: 10, format: "png" });
      await addFiles(["/a.png", "/b.png"]);

      removeFile(0);
      const fileList = get(files);
      expect(fileList).toHaveLength(1);
      expect(fileList[0].name).toBe("b.png");
    });

    it("全ファイル削除後にselectedIndexが-1になる", async () => {
      mockInvoke.mockResolvedValue({ width: 10, height: 10, format: "png" });
      await addFiles(["/a.png"]);

      removeFile(0);
      expect(get(selectedIndex)).toBe(-1);
    });
  });

  describe("clearFiles", () => {
    it("全ファイルを削除しselectedIndexをリセットする", async () => {
      mockInvoke.mockResolvedValue({ width: 10, height: 10, format: "png" });
      await addFiles(["/a.png", "/b.png"]);

      clearFiles();
      expect(get(files)).toHaveLength(0);
      expect(get(selectedIndex)).toBe(-1);
    });
  });

  describe("selectFile", () => {
    it("指定インデックスを選択する", async () => {
      mockInvoke.mockResolvedValue({ width: 10, height: 10, format: "png" });
      await addFiles(["/a.png", "/b.png"]);

      selectFile(1);
      expect(get(selectedIndex)).toBe(1);
    });
  });

  describe("selectedFile", () => {
    it("選択中のファイルを返す", async () => {
      mockInvoke.mockResolvedValue({ width: 10, height: 10, format: "png" });
      await addFiles(["/a.png", "/b.png"]);
      selectFile(1);

      const file = get(selectedFile);
      expect(file?.name).toBe("b.png");
    });

    it("未選択時はnullを返す", () => {
      expect(get(selectedFile)).toBeNull();
    });
  });

  describe("executeCrop", () => {
    it("クロップを実行し結果を格納する", async () => {
      mockInvoke
        .mockResolvedValueOnce({ width: 10, height: 10, format: "png" })
        .mockResolvedValueOnce([
          { input_path: "/a.png", output_path: "/a_cropped.png", success: true, error: null },
        ]);

      await addFiles(["/a.png"]);
      await executeCrop();

      expect(get(status)).toBe("done");
      expect(get(progress)).toBe(1);
    });

    it("ファイルがない場合は何もしない", async () => {
      await executeCrop();
      expect(get(status)).toBe("idle");
    });
  });
});
