import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "./LineChart.css";

const buildChartData = (start, x, data) => {
  const end = start + 50;

  const y = d3
    .scaleLinear()
    .domain([d3.min(data, (d) => d.value), d3.max(data, (d) => d.value)])
    .range([end, start]);

  const line = d3
    .line()
    .curve(d3.curveBasis)
    .defined((d) => !isNaN(d.value))
    .x((d) => x(d.startTime))
    .y((d) => y(d.value));

  return { start, y, line, end };
};

const bisectDate = d3.bisector((d) => d.startTime).left;

const getNearestPoint = (mouseX, data, scaleX, scaleY) => {
  const date = scaleX.invert(mouseX);
  const i = bisectDate(data, date, 1);
  const d = data[i];
  const nearestY = scaleY(d.value);
  const nearestX = scaleX(d.startTime);

  return { d, x: nearestX, y: nearestY };
};

const addLine = (data, line, color) => (el) =>
  el
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", `var(--${color})`)
    .attr("stroke-width", 3)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("d", line);

const addVertical = (start, end) => (el) =>
  el
    .append("line")
    .classed("mouse-line", true)
    .attr("stroke-width", "1px")
    .attr("stroke", "var(--gray)")
    .attr("display", "none")
    .attr("x1", 0)
    .attr("x2", 0)
    .attr("y1", start)
    .attr("y2", end);

const addDot = (id, color) => (el) => {
  const group = el
    .append("g")
    .classed(`label_${id}`, true)
    .attr("display", "none");

  group
    .append("circle")
    .attr("r", 7)
    .attr("fill", `var(--${color})`)
    .attr("cx", 0)
    .attr("cy", 0);

  group
    .append("text")
    .classed(`label-text_${id}`, true)
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("y", 3)
    .text("");
};

const updateDot = (id, nearest) => (el) => {
  el.selectAll(`.label_${id}`)
    .attr("display", null)
    .attr("transform", `translate(${nearest.x}, ${nearest.y})`);

  el.selectAll(`.label-text_${id}`).text(nearest.d.value);
};

const draw = (ref, heartRate, power, cadence) => {
  const totalHeight = 300;
  const totalWidth = 200;
  const segmentPadding = 28;

  const margin = { top: 2, right: 10, bottom: 2, left: 30 },
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
      d3.max(heartRate, (d) => d.startTime),
      d3.min(heartRate, (d) => d.startTime),
    ]);

  const heartRateChart = buildChartData(20, x, heartRate);

  const powerChart = buildChartData(
    heartRateChart.end + segmentPadding,
    x,
    power
  );

  const cadenceChart = buildChartData(
    powerChart.end + segmentPadding,
    x,
    cadence
  );

  // lines
  svg.call(addLine(heartRate, heartRateChart.line, "red"));
  svg.call(addLine(power, powerChart.line, "green"));
  svg.call(addLine(cadence, cadenceChart.line, "yellow"));

  const mouseArea = svg.append("g");
  mouseArea
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "transparent")
    .on("mousemove", (e) => {
      const mouseX = e.offsetX - margin.left;

      const nearestHeartRate = getNearestPoint(
        mouseX,
        heartRate,
        x,
        heartRateChart.y
      );

      const nearestPower = getNearestPoint(mouseX, power, x, powerChart.y);

      const nearestCadence = getNearestPoint(
        mouseX,
        cadence,
        x,
        cadenceChart.y
      );

      svg
        .selectAll(".mouse-line")
        .attr("display", null)
        .attr("x1", nearestHeartRate.x)
        .attr("x2", nearestHeartRate.x);

      mouseArea.call(updateDot("heart-rate", nearestHeartRate));
      mouseArea.call(updateDot("power", nearestPower));
      mouseArea.call(updateDot("cadence", nearestCadence));
    });

  // verticals
  mouseArea.call(addVertical(heartRateChart.start, heartRateChart.end));
  mouseArea.call(addVertical(powerChart.start, powerChart.end));
  mouseArea.call(addVertical(cadenceChart.start, cadenceChart.end));

  // dots
  mouseArea.call(addDot("heart-rate", "red"));
  mouseArea.call(addDot("power", "green"));
  mouseArea.call(addDot("cadence", "yellow"));

  // labels
  svg
    .append("text")
    .text("Heart Rate")
    .attr("x", 0 - margin.left)
    .attr("y", heartRateChart.start - 6);

  svg
    .append("text")
    .text("Power")
    .attr("x", 0 - margin.left)
    .attr("y", powerChart.start - 6);

  svg
    .append("text")
    .text("Cadence")
    .attr("x", 0 - margin.left)
    .attr("y", cadenceChart.start - 6);

  // axes
  svg
    .append("g")
    .classed("label", true)
    .call(d3.axisLeft(heartRateChart.y).ticks(3));

  svg
    .append("g")
    .classed("label", true)
    .call(d3.axisLeft(powerChart.y).ticks(3));

  svg
    .append("g")
    .classed("label", true)
    .call(d3.axisLeft(cadenceChart.y).ticks(3));
};

export const MultiChart = ({ heartRate, power, cadence }) => {
  const chartRef = useRef();

  useEffect(() => {
    draw(chartRef, heartRate, power, cadence);
  }, [heartRate, power, cadence]);

  return <div ref={chartRef} className="multi-chart"></div>;
};
