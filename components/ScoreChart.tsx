"use client";

import type { CallSession } from "@/lib/types";

interface ScoreChartProps {
  history: CallSession[];
}

const CHART_PADDING_LEFT = 40;
const CHART_PADDING_RIGHT = 20;
const CHART_PADDING_TOP = 20;
const CHART_PADDING_BOTTOM = 40;
const Y_MIN = 0;
const Y_MAX = 10;
const Y_TICKS = [0, 2, 4, 6, 8, 10];

export default function ScoreChart({ history }: ScoreChartProps) {
  // Filter to sessions with a scorecard, sort by date, take last 10
  const scoredSessions = history
    .filter((s) => s.scorecard)
    .sort(
      (a, b) =>
        new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
    )
    .slice(-10);

  if (scoredSessions.length < 2) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-8 text-center">
        <p className="text-sm text-gray-500">
          Complete more calls to see trends
        </p>
      </div>
    );
  }

  const viewBoxWidth = 600;
  const viewBoxHeight = 250;
  const plotWidth = viewBoxWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
  const plotHeight = viewBoxHeight - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;

  // Map data to coordinates
  const points = scoredSessions.map((session, i) => {
    const x =
      CHART_PADDING_LEFT +
      (i / (scoredSessions.length - 1)) * plotWidth;
    const score = session.scorecard!.overallScore;
    const y =
      CHART_PADDING_TOP +
      plotHeight -
      ((score - Y_MIN) / (Y_MAX - Y_MIN)) * plotHeight;
    return { x, y, score, date: session.startedAt, name: session.scenarioName };
  });

  // Build SVG path
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Area fill path (closed shape below the line)
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    CHART_PADDING_TOP + plotHeight
  } L ${points[0].x} ${CHART_PADDING_TOP + plotHeight} Z`;

  // X-axis labels
  const xLabels = scoredSessions.map((session, i) => {
    const d = new Date(session.startedAt);
    const label =
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const x =
      CHART_PADDING_LEFT +
      (i / (scoredSessions.length - 1)) * plotWidth;
    return { x, label };
  });

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
      <h3 className="text-sm font-semibold text-white mb-4">Score Trend</h3>
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y-axis grid lines + labels */}
        {Y_TICKS.map((tick) => {
          const y =
            CHART_PADDING_TOP +
            plotHeight -
            ((tick - Y_MIN) / (Y_MAX - Y_MIN)) * plotHeight;
          return (
            <g key={tick}>
              <line
                x1={CHART_PADDING_LEFT}
                y1={y}
                x2={viewBoxWidth - CHART_PADDING_RIGHT}
                y2={y}
                stroke="currentColor"
                className="text-gray-800"
                strokeWidth="0.5"
              />
              <text
                x={CHART_PADDING_LEFT - 8}
                y={y + 3.5}
                textAnchor="end"
                className="fill-gray-500"
                fontSize="10"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGradient)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            {/* Outer glow */}
            <circle cx={p.x} cy={p.y} r="6" fill="#22c55e" opacity="0.15" />
            {/* Dot */}
            <circle
              cx={p.x}
              cy={p.y}
              r="3"
              fill="#22c55e"
              stroke="#0a0a0a"
              strokeWidth="1.5"
            />
            {/* Score label on hover area (tooltip alternative) */}
            <text
              x={p.x}
              y={p.y - 10}
              textAnchor="middle"
              className="fill-green-400"
              fontSize="9"
              fontWeight="600"
            >
              {p.score.toFixed(1)}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {xLabels.map((lbl, i) => {
          // Only show a subset of labels to avoid overlap
          const showLabel =
            xLabels.length <= 5 ||
            i === 0 ||
            i === xLabels.length - 1 ||
            i % Math.ceil(xLabels.length / 5) === 0;

          if (!showLabel) return null;

          return (
            <text
              key={i}
              x={lbl.x}
              y={CHART_PADDING_TOP + plotHeight + 20}
              textAnchor="middle"
              className="fill-gray-500"
              fontSize="9"
            >
              {lbl.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
