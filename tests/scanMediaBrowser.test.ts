import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { scanMediaBrowser } from "../src/scanMediaBrowser";
import exifr from "exifr";

vi.mock("exifr", () => ({
  default: {
    parse: vi.fn(),
  },
}));

const mockedExif = vi.mocked(exifr);

describe("scanMediaBrowser", () => {
  const originalCreateElement = document.createElement.bind(document);

  beforeEach(() => {
    mockedExif.parse.mockImplementation(async (data) => {
      const file = data as File;
      if (file.name === "photo1.jpg") {
        return { DateTimeOriginal: "2021-02-01T00:00:00Z" } as any;
      }
      throw new Error("no exif");
    });

    Object.defineProperty(URL, "createObjectURL", {
      value: vi.fn((file: Blob) => `blob:${(file as File).name}`),
      writable: true,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      value: vi.fn(() => undefined),
      writable: true,
    });

    vi.spyOn(document, "createElement").mockImplementation((tagName) => {
      if (tagName === "video") {
        const video = originalCreateElement("video") as HTMLVideoElement;
        Object.defineProperty(video, "duration", { value: 2, writable: false });
        Object.defineProperty(video, "src", {
          set: () => {
            video.onloadedmetadata?.(new Event("loadedmetadata"));
          },
          get: () => "blob:video",
        });
        return video;
      }
      return originalCreateElement(tagName);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses EXIF when present and falls back to lastModified", async () => {
    const photo1 = new File(["a"], "photo1.jpg", {
      type: "image/jpeg",
      lastModified: 1_000,
    });
    const photo2 = new File(["b"], "photo2.png", {
      type: "image/png",
      lastModified: 2_000,
    });
    const video = new File(["c"], "clip.mp4", {
      type: "video/mp4",
      lastModified: 3_000,
    });

    const files = [photo1, photo2, video];
    const fileList = {
      length: files.length,
      item: (index: number) => files[index] ?? null,
    } as FileList;
    files.forEach((file, index) => {
      (fileList as any)[index] = file;
    });

    const items = await scanMediaBrowser(fileList);

    const exifItem = items.find((item) => item.name === "photo1.jpg");
    const fallbackItem = items.find((item) => item.name === "photo2.png");
    const videoItem = items.find((item) => item.name === "clip.mp4");

    expect(exifItem?.timestamp).toBe(Date.parse("2021-02-01T00:00:00Z"));
    expect(fallbackItem?.timestamp).toBe(2_000);
    expect(videoItem?.end).toBe(5_000);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:clip.mp4");
  });
});
