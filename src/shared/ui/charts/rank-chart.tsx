"use client";

import { useState } from "react";
import { CHART_INK } from "@/shared/ui/charts/chart-colors";

export interface RankDatum {
  label: string;
  value: number;
  color: string;
  sub?: string;
}

export interface RankChartProps {
  data: RankDatum[];
}

export function RankChart({ data }: RankChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((datum) => datum.value));

  return (
    <ol className="flex flex-col gap-3.5">
      {data.slice(0, 5).map((datum, index) => {
        const percent = Math.max(3, Math.round((datum.value / max) * 100));
        const active = hovered === index;

        return (
          <li
            key={`${index}-${datum.label}`}
            className="flex items-center gap-3"
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand-soft text-xs font-black text-brand">
              {index + 1}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="flex items-center justify-between gap-1">
                <span className="truncate text-xs font-medium text-ink" title={datum.label}>
                  {datum.label}
                </span>
                <span className="text-xs font-semibold text-muted">{datum.value}</span>
              </span>
              <div className="h-2.5 w-full rounded-full" style={{ backgroundColor: CHART_INK.grid }}>
                {datum.value > 0 ? (
                  <div
                    className="h-2.5 rounded-full transition-[width]"
                    style={{ width: `${percent}%`, backgroundColor: datum.color, opacity: active ? 0.85 : 1 }}
                  />
                ) : null}
              </div>
            </span>
          </li>
        );
      })}
    </ol>
  );
}