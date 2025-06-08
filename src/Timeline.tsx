import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { MediaItem } from '../electron/scanMedia';

interface Props {
  items: MediaItem[];
}

export function Timeline({ items }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current).select('svg');
    svg.selectAll('*').remove();

    const width = 800;
    const height = 200;
    svg.attr('width', width).attr('height', height);

    const times = items.flatMap(d => [d.timestamp, d.end || d.timestamp]);
    const min = d3.min(times) ?? Date.now();
    const max = d3.max(times) ?? Date.now();
    const x = d3.scaleTime().domain([new Date(min), new Date(max)]).range([40, width - 40]);

    const g = svg.append('g');

    // photo points
    g.selectAll('circle')
      .data(items.filter(d => d.type === 'photo'))
      .enter()
      .append('circle')
      .attr('cx', d => x(new Date(d.timestamp)))
      .attr('cy', height / 2)
      .attr('r', 5)
      .append('title')
      .text(d => `${d.name}\n${new Date(d.timestamp).toISOString()}`);

    // video bars
    g.selectAll('rect')
      .data(items.filter(d => d.type === 'video'))
      .enter()
      .append('rect')
      .attr('x', d => x(new Date(d.timestamp)))
      .attr('y', height / 2 - 5)
      .attr('height', 10)
      .attr('width', d => x(new Date(d.end ?? d.timestamp)) - x(new Date(d.timestamp)))
      .append('title')
      .text(d => `${d.name}\n${new Date(d.timestamp).toISOString()} - ${new Date(d.end ?? d.timestamp).toISOString()}`);

    const axis = d3.axisBottom(x);
    svg.append('g').attr('transform', `translate(0,${height - 20})`).call(axis);
  }, [items]);

  return <div ref={ref}><svg /></div>;
}
