"use client";

import { useState } from "react";
import { CHART_INK } from "@/shared/ui/charts/chart-colors";

export interface BarDatum {
  label: string;
  value: number;
  color: string;
}

export interface BarChartProps {
  data: BarDatum[];
}

export function BarChart({ data }: BarChartProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));

  if (data.length === 0) {
    return null;
  }

  return (
    <ul className="flex flex-col gap-3">
      {data.map((datum) => {
        const widthPct = Math.max(2, (datum.value / max) * 100);
        const isHovered = hovered === datum.label;

        return (
          <li key={datum.label} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-xs font-medium text-secondary" title={datum.label}>
              {datum.label}
            </span>
            <div
              className="h-6 flex-1 rounded-full"
              style={{ backgroundColor: CHART_INK.grid }}
              onMouseEnter={() => setHovered(datum.label)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(datum.label)}
              tabIndex={0}
              role="img"
              aria-label={`${datum.label}: ${datum.value}`}
            >
              <div
                className="h-6 rounded-full transition-[width]"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: datum.color,
                  opacity: isHovered ? 0.85 : 1,
                }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-xs font-semibold text-ink">{datum.value}</span>
          </li>
        );
      })}
    </ul>
  );
}
