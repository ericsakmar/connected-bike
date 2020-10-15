import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "./LineChart.css";

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
    .attr("stroke", "black")
    .attr("x1", 0)
    .attr("x2", 0)
    .attr("y1", start)
    .attr("y2", end);

const addDot = (id, color) => (el) => {
  const group = el.append("g").classed(`label_${id}`, true);

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

const draw = (ref, heartRate, power, cadence) => {
  const totalHeight = 300;
  const totalWidth = 200;

  const segmentHeight = 50;
  const segmentPadding = 35;

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

  const heartRateStart = 20;
  const heartRateEnd = heartRateStart + segmentHeight;
  const heartRateY = d3
    .scaleLinear()
    .domain([
      d3.min(heartRate, (d) => d.value),
      d3.max(heartRate, (d) => d.value),
    ])
    .range([heartRateEnd, heartRateStart]);

  const heartRateLine = d3
    .line()
    .curve(d3.curveBasis)
    .defined((d) => !isNaN(d.value))
    .x((d) => x(d.startTime))
    .y((d) => heartRateY(d.value));

  const powerStart = heartRateEnd + segmentPadding;
  const powerEnd = powerStart + segmentHeight;
  const powerY = d3
    .scaleLinear()
    .domain([d3.min(power, (d) => d.value), d3.max(power, (d) => d.value)])
    .range([powerEnd, powerStart]);

  const powerLine = d3
    .line()
    .curve(d3.curveBasis)
    .defined((d) => !isNaN(d.value))
    .x((d) => x(d.startTime))
    .y((d) => powerY(d.value));

  const cadenceStart = powerEnd + segmentPadding;
  const cadenceEnd = cadenceStart + segmentHeight;
  const cadenceY = d3
    .scaleLinear()
    .domain([d3.min(cadence, (d) => d.value), d3.max(cadence, (d) => d.value)])
    .range([cadenceEnd, cadenceStart]);

  const cadenceLine = d3
    .line()
    .curve(d3.curveBasis)
    .defined((d) => !isNaN(d.value))
    .x((d) => x(d.startTime))
    .y((d) => cadenceY(d.value));

  // lines
  svg.call(addLine(heartRate, heartRateLine, "red"));
  svg.call(addLine(power, powerLine, "green"));
  svg.call(addLine(cadence, cadenceLine, "yellow"));

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
        heartRateY
      );
      const nearestPower = getNearestPoint(mouseX, power, x, powerY);
      const nearestCadence = getNearestPoint(mouseX, cadence, x, cadenceY);

      svg
        .selectAll(".mouse-line")
        .attr("x1", nearestHeartRate.x)
        .attr("x2", nearestHeartRate.x);

      svg
        .selectAll(".label_heart-rate")
        .attr(
          "transform",
          `translate(${nearestHeartRate.x}, ${nearestHeartRate.y})`
        );
      svg.selectAll(".label-text_heart-rate").text(nearestHeartRate.d.value);

      svg
        .selectAll(".label_power")
        .attr("transform", `translate(${nearestPower.x}, ${nearestPower.y})`);
      svg.selectAll(".label-text_power").text(nearestPower.d.value);

      svg
        .selectAll(".label_cadence")
        .attr(
          "transform",
          `translate(${nearestCadence.x}, ${nearestCadence.y})`
        );
      svg.selectAll(".label-text_cadence").text(nearestCadence.d.value);
    });

  // verticals
  mouseArea.call(addVertical(heartRateStart, heartRateEnd));
  mouseArea.call(addVertical(powerStart, powerEnd));
  mouseArea.call(addVertical(cadenceStart, cadenceEnd));

  // dots
  mouseArea.call(addDot("heart-rate", "red"));
  mouseArea.call(addDot("power", "green"));
  mouseArea.call(addDot("cadence", "yellow"));

  svg
    .append("text")
    .text("Heart Rate")
    .attr("x", 0 - margin.left)
    .attr("y", heartRateStart - 8);

  svg
    .append("text")
    .text("Power")
    .attr("x", 0 - margin.left)
    .attr("y", powerStart - 8);

  svg
    .append("text")
    .text("Cadence")
    .attr("x", 0 - margin.left)
    .attr("y", cadenceStart - 8);

  // axes
  svg.append("g").classed("label", true).call(d3.axisLeft(heartRateY).ticks(3));
  svg.append("g").classed("label", true).call(d3.axisLeft(powerY).ticks(3));
  svg.append("g").classed("label", true).call(d3.axisLeft(cadenceY).ticks(3));
};

export const MultiChart = ({ heartRate, power, cadence }) => {
  const chartRef = useRef();

  useEffect(() => {
    draw(chartRef, heartRate, power, cadence);
  }, [heartRate, power, cadence]);

  return <div ref={chartRef} className="multi-chart"></div>;
};
