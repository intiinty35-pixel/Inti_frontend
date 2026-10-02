"use client";

import { CHART_INK } from "@/shared/ui/charts/chart-colors";

export interface DonutDatum {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  data: DonutDatum[];
  centerLabel?: string;
}

const SIZE = 168;
const STROKE = 22;
const RADIUS = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * RADIUS;

export function DonutChart({ data, centerLabel = "total" }: DonutChartProps) {
  const total = data.reduce((sum, datum) => sum + datum.value, 0);
  const hasData = total > 0;

  const segments = (hasData ? data : [])
    .reduce<{ label: string; color: string; length: number; offset: number }[]>((items, datum) => {
      const offset = items.reduce((sum, item) => sum + item.length, 0);
      const length = (datum.value / total) * CIRC;
      return [...items, { label: datum.label, color: datum.color, length, offset }];
    }, [])
    .filter((segment) => segment.length > 0);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="size-40 shrink-0"
        role="img"
        aria-label={`Distribución: ${centerLabel}`}
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={CHART_INK.grid}
          strokeWidth={STROKE}
        />
        {segments.map((segment) => (
          <circle
            key={segment.label}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={segment.color}
            strokeWidth={STROKE}
            strokeDasharray={`${segment.length} ${CIRC - segment.length}`}
            strokeDashoffset={-segment.offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        ))}
        <text
          x={SIZE / 2}
          y={SIZE / 2 - 2}
          textAnchor="middle"
          fontSize="22"
          fontWeight="700"
          fill={CHART_INK.primary}
        >
          {total}
        </text>
        <text x={SIZE / 2} y={SIZE / 2 + 16} textAnchor="middle" fontSize="10" fill={CHART_INK.muted}>
          {centerLabel}
        </text>
      </svg>

      <ul className="flex flex-col gap-2 text-xs">
        {(hasData ? data : []).map((datum) => {
          const percent = Math.round((datum.value / total) * 100);
          return (
            <li key={datum.label} className="flex items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: datum.color }} />
              <span className="text-ink">{datum.label}</span>
              <span className="ml-auto font-semibold text-muted">{percent}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
