import { describe, it, expect, vi, beforeEach } from "vitest";
import exifr from "exifr";
import fs from "fs/promises";
import { execFile } from "node:child_process";

vi.mock("fs/promises", () => ({
  default: {
    readdir: vi.fn(),
    stat: vi.fn(),
  },
}));

vi.mock("exifr", () => ({
  default: {
    parse: vi.fn(),
  },
}));

vi.mock("node:child_process", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:child_process")>();
  const execFileMock = vi.fn();
  return {
    ...actual,
    execFile: execFileMock,
  };
});

vi.mock("node:util", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:util")>();
  return {
    ...actual,
    promisify: () => async () => ({
      stdout: "3.5",
      stderr: "",
    }),
  };
});

vi.mock("@ffprobe-installer/ffprobe", () => ({
  default: {
    path: "/fake/ffprobe",
  },
  path: "/fake/ffprobe",
}));

const mockedFs = vi.mocked(fs);
const mockedExif = vi.mocked(exifr);
const mockedExecFile = vi.mocked(execFile);

describe("scanMedia", () => {
  beforeEach(() => {
    mockedFs.readdir.mockResolvedValue(["a.jpg", "b.mp4", "c.txt"]);
    mockedFs.stat.mockImplementation(async (fullPath) => {
      const name = String(fullPath);
      if (name.endsWith("a.jpg")) {
        return {
          isFile: () => true,
          birthtimeMs: 1_600_000_000_000,
        } as any;
      }
      if (name.endsWith("b.mp4")) {
        return {
          isFile: () => true,
          birthtimeMs: 1_600_000_100_000,
        } as any;
      }
      return { isFile: () => false } as any;
    });

    mockedExif.parse.mockResolvedValue({
      DateTimeOriginal: "2020-01-01T00:00:00Z",
    });

    mockedExecFile.mockImplementation((_path, _args, callback) => {
      callback(null, "3.5", "");
      return undefined as any;
    });
  });

  it("filters media and computes timestamps/durations", async () => {
    const { scanMedia } = await import("../electron/scanMedia.ts");
    const items = await scanMedia("test");

    expect(items).toHaveLength(2);
    const photo = items.find((item) => item.type === "photo");
    const video = items.find((item) => item.type === "video");

    expect(photo?.timestamp).toBe(Date.parse("2020-01-01T00:00:00Z"));
    expect(photo?.thumbnailUrl).toBe("file://test/a.jpg");

    expect(video?.timestamp).toBe(1_600_000_100_000);
    expect(typeof video?.end).toBe("number");
  });
});
