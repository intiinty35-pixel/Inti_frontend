"use client";

import { useMemo, useState } from "react";

export interface TrendPoint {
  label: string;
  value: number;
}

export interface TrendChartProps {
  data: TrendPoint[];
  color?: string;
  height?: number;
}

const WIDTH = 820;
const LEFT = 48;
const RIGHT = 18;
const TOP = 18;
const BOTTOM = 38;

function pathFor(points: Array<{ x: number; y: number }>) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
}

export function TrendChart({ data, color = "#0b5ed7", height = 300 }: TrendChartProps) {
  const [activeIndex, setActiveIndex] = useState(Math.max(0, data.length - 1));

  const chart = useMemo(() => {
    const maxRaw = Math.max(1, ...data.map((point) => point.value));
    const max = Math.max(4, Math.ceil(maxRaw / 4) * 4);
    const innerW = WIDTH - LEFT - RIGHT;
    const innerH = height - TOP - BOTTOM;
    const step = data.length > 1 ? innerW / (data.length - 1) : innerW;
    const points = data.map((point, index) => ({
      ...point,
      x: LEFT + step * index,
      y: TOP + innerH - (point.value / max) * innerH,
    }));
    const gridY = Array.from({ length: 9 }, (_, index) => ({
      y: TOP + (innerH / 8) * index,
      value: Math.round(max - (max / 8) * index),
    }));
    const gridX = Array.from({ length: 13 }, (_, index) => LEFT + (innerW / 12) * index);
    return { max, innerW, innerH, points, gridY, gridX, path: pathFor(points) };
  }, [data, height]);

  if (data.length === 0) return null;

  const active = chart.points[Math.min(activeIndex, chart.points.length - 1)];
  const labelEvery = Math.max(1, Math.ceil(data.length / 8));

  return (
    <div className="w-full rounded-card border border-edge bg-white p-3 shadow-[var(--shadow-card)]">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted">Tendencia de consultas</p>
          <p className="text-sm font-bold text-ink">Ultimos 30 dias</p>
        </div>
        <div className="rounded-card border border-edge bg-surface-muted px-3 py-1.5 text-right">
          <p className="text-[10px] font-black uppercase tracking-wide text-muted">{active?.label}</p>
          <p className="text-lg font-black text-brand">{active?.value ?? 0}</p>
        </div>
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${height}`} className="w-full" role="img" aria-label="Tendencia de consultas">
        <rect x="0" y="0" width={WIDTH} height={height} fill="#ffffff" />

        {chart.gridY.map((line) => (
          <g key={line.y}>
            <line x1={LEFT} y1={line.y} x2={WIDTH - RIGHT} y2={line.y} stroke="#d7dde8" strokeWidth="1" />
            <text x="10" y={line.y + 4} fill="#667085" fontSize="10" fontWeight="700">
              {line.value}
            </text>
          </g>
        ))}

        {chart.gridX.map((x) => (
          <line key={x} x1={x} y1={TOP} x2={x} y2={height - BOTTOM} stroke="#eef1f6" strokeWidth="1" />
        ))}

        <path d={chart.path} fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        <path d={chart.path} fill="none" stroke={color} strokeWidth="1.15" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="5 4" opacity="0.75" />

        {chart.points.map((point, index) => {
          const selected = index === activeIndex;
          const width = chart.innerW / Math.max(1, data.length - 1);
          const showLabel = point.value > 0 || index === activeIndex;

          return (
            <g key={`${point.label}-${index}`}>
              <rect
                x={point.x - width / 2}
                y={TOP}
                width={width}
                height={chart.innerH}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => setActiveIndex(index)}
              />
              <circle cx={point.x} cy={point.y} r={selected ? 4.5 : 2.5} fill={selected ? "#111827" : point.value > 0 ? "#111827" : "transparent"} />
              {showLabel ? (
                <g>
                  <rect
                    x={point.x - 25}
                    y={Math.max(2, point.y - 32)}
                    width="50"
                    height="18"
                    rx="3"
                    fill={selected ? "#16a34a" : "#ef4444"}
                  />
                  <text x={point.x} y={Math.max(15, point.y - 19)} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800">
                    {point.label} · {point.value}
                  </text>
                </g>
              ) : null}
              {index % labelEvery === 0 || index === chart.points.length - 1 ? (
                <text x={point.x} y={height - 12} textAnchor="middle" fill="#667085" fontSize="10" fontWeight="700">
                  {point.label}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
