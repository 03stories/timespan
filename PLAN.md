# Timespan Mockup Implementation Plan

## Goals from timespan-mockup.jpg
- Visualize photos/videos on a horizontal time axis (x = creation timestamp).
- Each row represents a folder/camera source.
- Photos render as thumbnails anchored by their left edge at their creation time.
- Thumbnails have a minimum width and may overlap.
- Videos render as bars spanning from creation time to end time.
- Hover shows details below; click opens a lightbox.
- Provide zoom/pan on the timeline.

## Proposed Work Plan
1. Data grouping and layout inputs (done)
   - Group `MediaItem`s by source (folder name or camera) for row-based rendering.
   - Derive row order and stable row ids for D3 joins.
   - Extend `MediaItem` (if needed) with `sourceLabel` and `rowIndex`.

2. Scale, axes, and row geometry (done)
   - Move chart sizing into layout constants: `rowHeight`, `rowGap`, `axisHeight`, `margin`.
   - Compute chart height from row count.
   - Build `x` scale from min/max timestamps and an `y` scale from row index.
   - Render horizontal row separators and left-side row labels.

3. Photo layout rules (done)
   - Render photo thumbnails as `image` elements instead of circles.
   - Apply a minimum width; compute displayed width based on thumbnail aspect ratio.
   - Place each photo with its left edge at `x(timestamp)` and `y = rowTop + padding`.
   - Allow overlap (no collision avoidance) to match the mockup.

4. Video layout rules
   - Render videos as `rect` bars within the row area.
   - `x = x(startTimestamp)` and `width = x(endTimestamp) - x(startTimestamp)`.
   - Add a lightweight label (e.g., “video: 45m”) when width allows.

5. Interaction: hover + lightbox
   - Replace the current tooltip with a row-aligned detail panel below the chart.
   - On hover, populate the panel with filename, timestamps, and thumbnail.
   - On click, open a lightbox (modal) showing the full image/video.

6. Zoom / pan (partial)
   - Add D3 zoom behavior with `scaleExtent` and `translateExtent`.
   - Update the x-scale and redraw items/axis on zoom.
   - Preserve row layout during zoom (only x changes).

7. Styling
   - Update `css/style.css` for row labels, separators, thumbnails, bars, and the detail panel.
   - Match mockup spacing (thin separators, subtle labels).

8. Testing / sample data
   - Validate with `iceland-sample.json` and any local directories.
   - Add small unit coverage for grouping + layout utilities if extracted.
