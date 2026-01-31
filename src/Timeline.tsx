import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { MediaItem } from './mediaTypes';

interface Props {
  items: MediaItem[];
}

export function Timeline({ items }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const container = d3.select(ref.current);
    const svg = container.select('svg');
    svg.selectAll('*').remove();
    container.selectAll('.tooltip').remove();

    const width = 800;
    const height = 200;
    svg.attr('width', width).attr('height', height);

    const times = items.flatMap(d => [d.timestamp, d.end || d.timestamp]);
    const min = d3.min(times) ?? Date.now();
    const max = d3.max(times) ?? Date.now();
    const x = d3.scaleTime().domain([new Date(min), new Date(max)]).range([40, width - 40]);

    const tooltip = container
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', '0');

    const g = svg.append('g');

    // photo points
    g.selectAll('circle')
      .data(items.filter(d => d.type === 'photo'))
      .enter()
      .append('circle')
      .attr('cx', d => x(new Date(d.timestamp)))
      .attr('cy', height / 2)
      .attr('r', 5)
      .on('mouseenter', (event, d) => {
        if (!d.thumbnailUrl) return;
        tooltip
          .style('opacity', '1')
          .html(
            `<div class="tooltip-title">${d.name}</div>` +
            `<img src="${d.thumbnailUrl}" alt="${d.name}" />`
          );
      })
      .on('mousemove', (event) => {
        tooltip
          .style('left', `${event.offsetX + 14}px`)
          .style('top', `${event.offsetY - 14}px`);
      })
      .on('mouseleave', () => {
        tooltip.style('opacity', '0');
      });

    // video bars
    g.selectAll('rect')
      .data(items.filter(d => d.type === 'video'))
      .enter()
      .append('rect')
      .attr('x', d => x(new Date(d.timestamp)))
      .attr('y', height / 2 - 5)
      .attr('height', 10)
      .attr('width', d => x(new Date(d.end ?? d.timestamp)) - x(new Date(d.timestamp)));

    const axis = d3.axisBottom(x);
    svg.append('g').attr('transform', `translate(0,${height - 20})`).call(axis);
  }, [items]);

  return (
    <div className="timeline" ref={ref}>
      <svg />
    </div>
  );
}
