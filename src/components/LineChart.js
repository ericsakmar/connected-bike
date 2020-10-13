import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "./LineChart.css";

const draw = (ref, data, totalWidth, totalHeight, color) => {
  const margin = { top: 2, right: 0, bottom: 2, left: 30 },
    width = totalWidth - margin.left - margin.right,
    height = totalHeight - margin.top - margin.bottom;

  d3.select(ref.current).select("svg").remove();

  const svg = d3
    .select(ref.current)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const x = d3
    .scaleTime()
    .range([width, 0])
    .domain([
      d3.max(data, (d) => d.startTime),
      d3.min(data, (d) => d.startTime),
    ]);

  const y = d3
    .scaleLinear()
    .domain([d3.min(data, (d) => d.value), d3.max(data, (d) => d.value)])
    .range([height, 0]);

  const line = d3
    .line()
    .curve(d3.curveBasis)
    .defined((d) => !isNaN(d.value))
    .x((d) => x(d.startTime))
    .y((d) => y(d.value));

  svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", `var(--${color})`)
    .attr("stroke-width", 3)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("d", line);

  svg.append("g").classed("label", true).call(d3.axisLeft(y).ticks(3));
};

export const LineChart = ({ data, color }) => {
  const chartRef = useRef();

  useEffect(() => {
    draw(chartRef, data, 300, 100, color);
  }, [data, color]);

  return <div ref={chartRef} className="line-chart"></div>;
};
