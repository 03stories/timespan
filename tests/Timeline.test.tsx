import { render, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Timeline } from "../src/Timeline";
import type { MediaItem } from "../src/mediaTypes";

describe("Timeline", () => {
  it("renders grouped labels and media elements", async () => {
    const items: MediaItem[] = [
      {
        name: "photo.jpg",
        path: "folder-a/photo.jpg",
        type: "photo",
        timestamp: Date.parse("2022-01-01T00:00:00Z"),
        thumbnailUrl: "blob:photo",
      },
      {
        name: "clip.mp4",
        path: "folder-a/clip.mp4",
        type: "video",
        timestamp: Date.parse("2022-01-02T00:00:00Z"),
        end: Date.parse("2022-01-02T00:00:02Z"),
      },
    ];

    const { container, getByText } = render(
      <div style={{ width: 800 }}>
        <Timeline items={items} />
      </div>,
    );

    await waitFor(() => {
      expect(getByText("folder-a")).toBeDefined();
      expect(container.querySelectorAll("image.photo").length).toBe(1);
      expect(container.querySelectorAll("rect.video").length).toBe(1);
    });
  });
});
