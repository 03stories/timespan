import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { MediaItem } from "./mediaTypes";

interface Props {
  items: MediaItem[];
}

type SourceGroup = {
  key: string;
  label: string;
  items: MediaItem[];
};

export function Timeline({ items }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const zoomRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);

  useEffect(() => {
    if (!ref.current) return;
    const node = ref.current;

    const updateWidth = () => {
      const nextWidth = node.clientWidth || 0;
      setContainerWidth((prev) => (prev === nextWidth ? prev : nextWidth));
    };

    updateWidth();

    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => updateWidth());
      resizeObserver.observe(node);
    } else {
      window.addEventListener("resize", updateWidth);
    }

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const container = d3.select(ref.current);
    const svg = container.select<SVGSVGElement>("svg");
    svg.selectAll("*").remove();
    container.selectAll(".tooltip").remove();

    const width = Math.max(
      360,
      containerWidth || ref.current.clientWidth || 800,
    );
    const margin = { top: 16, right: 24, bottom: 24, left: 150 };
    const rowHeight = 84;
    const rowGap = 6;
    const axisOffset = 18;
    const minThumbWidth = 84;
    const thumbHeight = 56;

    const normalizePath = (value: string) => value.replace(/\\/g, "/");
    const getSourceKey = (item: MediaItem) => {
      const rawPath = item.path || item.name;
      const normalized = normalizePath(rawPath || "");
      if (!normalized || !normalized.includes("/")) return "browser";
      return normalized.split("/").slice(0, -1).join("/");
    };
    const getSourceLabel = (sourceKey: string) => {
      if (!sourceKey || sourceKey === "browser") return "Browser";
      const normalized = normalizePath(sourceKey);
      const parts = normalized.split("/").filter(Boolean);
      return parts[parts.length - 1] || "Media";
    };

    const grouped = d3.group(items, getSourceKey);
    const groups: SourceGroup[] = Array.from(grouped, ([key, groupItems]) => ({
      key,
      label: getSourceLabel(key),
      items: groupItems,
    })).sort((a, b) => d3.ascending(a.key, b.key));
    const rowCount = Math.max(1, groups.length);
    const rowAreaHeight =
      rowCount * rowHeight + Math.max(0, rowCount - 1) * rowGap;
    const axisY = margin.top + rowAreaHeight + axisOffset;
    const height = axisY + margin.bottom;
    svg.attr("width", width).attr("height", height);

    const times = items.flatMap((d) => [d.timestamp, d.end || d.timestamp]);
    const fallback = Date.now();
    const min = d3.min(times) ?? fallback - 1000 * 60 * 60 * 24;
    const max = d3.max(times) ?? fallback;
    const paddedMax = max === min ? max + 1000 * 60 * 60 : max;
    const baseX = d3
      .scaleTime()
      .domain([new Date(min), new Date(paddedMax)])
      .range([margin.left, width - margin.right]);

    const rowIndexByKey = new Map(
      groups.map((group, index) => [group.key, index]),
    );
    const rowTopForItem = (item: MediaItem) => {
      const key = getSourceKey(item);
      const index = rowIndexByKey.get(key) ?? 0;
      return margin.top + index * (rowHeight + rowGap);
    };

    const tooltip = container
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", "0");

    const g = svg.append("g");

    const rowGroup = g.append("g").attr("class", "rows");
    rowGroup
      .selectAll("line.row-line")
      .data(groups)
      .enter()
      .append("line")
      .attr("class", "row-line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr(
        "y1",
        (_d: SourceGroup, i: number) =>
          margin.top + i * (rowHeight + rowGap),
      )
      .attr(
        "y2",
        (_d: SourceGroup, i: number) =>
          margin.top + i * (rowHeight + rowGap),
      );

    rowGroup
      .selectAll("text.row-label")
      .data(groups)
      .enter()
      .append("text")
      .attr("class", "row-label")
      .attr("x", margin.left - 12)
      .attr(
        "y",
        (_d: SourceGroup, i: number) =>
          margin.top + i * (rowHeight + rowGap) + rowHeight / 2,
      )
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .text((d: SourceGroup) => d.label);

    // photo points
    const photoSelection = g
      .selectAll("image.photo")
      .data(items.filter((d) => d.type === "photo" && d.thumbnailUrl))
      .enter()
      .append("image")
      .attr("class", "photo")
      .attr("href", (d: MediaItem) => d.thumbnailUrl || "")
      .attr("x", (d: MediaItem) => baseX(new Date(d.timestamp)))
      .attr(
        "y",
        (d: MediaItem) => rowTopForItem(d) + (rowHeight - thumbHeight) / 2,
      )
      .attr("width", minThumbWidth)
      .attr("height", thumbHeight)
      .attr("preserveAspectRatio", "xMidYMid slice")
      .on("mouseenter", (event: MouseEvent, d: MediaItem) => {
        if (!d.thumbnailUrl) return;
        tooltip
          .style("opacity", "1")
          .html(
            `<div class="tooltip-title">${d.name}</div>` +
              `<img src="${d.thumbnailUrl}" alt="${d.name}" />`,
          );
      })
      .on("mousemove", (event: MouseEvent) => {
        tooltip
          .style("left", `${event.offsetX + 14}px`)
          .style("top", `${event.offsetY - 14}px`);
      })
      .on("mouseleave", () => {
        tooltip.style("opacity", "0");
      });

    // video bars
    const videoSelection = g
      .selectAll("rect.video")
      .data(items.filter((d) => d.type === "video"))
      .enter()
      .append("rect")
      .attr("class", "video")
      .attr("x", (d: MediaItem) => baseX(new Date(d.timestamp)))
      .attr("y", (d: MediaItem) => rowTopForItem(d) + rowHeight / 2 - 6)
      .attr("height", 12)
      .attr(
        "width",
        (d: MediaItem) =>
          baseX(new Date(d.end ?? d.timestamp)) - baseX(new Date(d.timestamp)),
      );

    const axis = d3.axisBottom(baseX);
    const axisGroup = svg
      .append("g")
      .attr("transform", `translate(0,${axisY})`)
      .call(axis);

    const applyTransform = (transform: d3.ZoomTransform) => {
      const currentX = transform.rescaleX(baseX);
      photoSelection.attr(
        "x",
        (d: MediaItem) => currentX(new Date(d.timestamp)),
      );
      videoSelection
        .attr("x", (d: MediaItem) => currentX(new Date(d.timestamp)))
        .attr(
          "width",
          (d: MediaItem) =>
            currentX(new Date(d.end ?? d.timestamp)) -
            currentX(new Date(d.timestamp)),
        );
      axisGroup.call(axis.scale(currentX));
    };

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.6, 160])
      .translateExtent([
        [margin.left, 0],
        [width - margin.right, height],
      ])
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        zoomRef.current = event.transform;
        applyTransform(event.transform);
      });

    const svgNode = svg.node();
    const hasViewBoxBase =
      svgNode &&
      "viewBox" in svgNode &&
      (svgNode as SVGSVGElement).viewBox?.baseVal;

    if (hasViewBoxBase) {
      svg.call(zoom);
      svg.call(zoom.transform, zoomRef.current);
    }

    applyTransform(zoomRef.current);
  }, [items, containerWidth]);

  return (
    <div className="timeline" ref={ref}>
      <svg />
    </div>
  );
}
