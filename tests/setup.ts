import { vi } from "vitest";

// @tauri-apps/api/core のモック
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

// @tauri-apps/plugin-dialog のモック
vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: vi.fn(),
}));
