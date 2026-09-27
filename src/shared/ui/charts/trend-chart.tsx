"use client";

import { useId, useState } from "react";
import { CHART_INK } from "@/shared/ui/charts/chart-colors";

export interface TrendPoint {
  label: string;
  value: number;
}

export interface TrendChartProps {
  data: TrendPoint[];
  color?: string;
  height?: number;
}

const WIDTH = 560;
const PAD_X = 8;
const PAD_TOP = 16;
const PAD_BOTTOM = 24;

export function TrendChart({ data, color = "#2a78d6", height = 180 }: TrendChartProps) {
  const gradientId = useId();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return null;
  }

  const max = Math.max(1, ...data.map((point) => point.value));
  const innerHeight = height - PAD_TOP - PAD_BOTTOM;
  const step = data.length > 1 ? (WIDTH - PAD_X * 2) / (data.length - 1) : 0;

  const points = data.map((point, index) => ({
    x: PAD_X + step * index,
    y: PAD_TOP + innerHeight - (point.value / max) * innerHeight,
    ...point,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${PAD_TOP + innerHeight} L${points[0].x},${PAD_TOP + innerHeight} Z`;

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;
  const labelEvery = Math.max(1, Math.ceil(data.length / 6));

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        className="w-full"
        role="img"
        aria-label="Tendencia de consultas en el tiempo"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.12" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        <line
          x1={PAD_X}
          y1={PAD_TOP + innerHeight}
          x2={WIDTH - PAD_X}
          y2={PAD_TOP + innerHeight}
          stroke={CHART_INK.baseline}
          strokeWidth={1}
        />

        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {points.map((point, index) => (
          <g key={point.label}>
            <rect
              x={point.x - step / 2}
              y={PAD_TOP}
              width={step || WIDTH}
              height={innerHeight}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(index)}
              onFocus={() => setHoverIndex(index)}
            />
            {index % labelEvery === 0 || index === points.length - 1 ? (
              <text
                x={point.x}
                y={height - 6}
                textAnchor="middle"
                fontSize="10"
                fill={CHART_INK.muted}
              >
                {point.label}
              </text>
            ) : null}
            {index === hoverIndex ? (
              <>
                <line
                  x1={point.x}
                  y1={PAD_TOP}
                  x2={point.x}
                  y2={PAD_TOP + innerHeight}
                  stroke={CHART_INK.baseline}
                  strokeWidth={1}
                />
                <circle cx={point.x} cy={point.y} r={5} fill={color} stroke={CHART_INK.surface} strokeWidth={2} />
              </>
            ) : null}
          </g>
        ))}
      </svg>

      {hovered ? (
        <div
          className="pointer-events-none absolute top-1 -translate-x-1/2 rounded-card border border-edge bg-surface px-2.5 py-1.5 text-xs shadow-[var(--shadow-card)]"
          style={{ left: `${(hovered.x / WIDTH) * 100}%` }}
        >
          <p className="font-semibold text-ink">{hovered.value}</p>
          <p className="text-muted">{hovered.label}</p>
        </div>
      ) : null}
    </div>
  );
}
