"use client";

import { useState } from "react";

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
  const [activeIndex, setActiveIndex] = useState(0);
  const visible = data.slice(0, 6);
  const max = Math.max(1, ...visible.map((datum) => datum.value));
  const total = visible.reduce((sum, datum) => sum + datum.value, 0);

  return (
    <div className="w-full overflow-hidden rounded-card border border-edge bg-white shadow-[var(--shadow-card)]">
      <div className="border-b border-edge bg-surface-muted px-4 py-3">
        <div className="grid grid-cols-[56px_minmax(0,1fr)_88px_120px] items-center gap-3 text-[10px] font-black uppercase tracking-[0.14em] text-muted">
          <span>Rank</span>
          <span>Publicacion</span>
          <span className="text-right">Consultas</span>
          <span className="text-right">Peso</span>
        </div>
      </div>

      <div className="divide-y divide-edge">
        {visible.map((datum, index) => {
          const active = activeIndex === index;
          const percent = total > 0 ? Math.round((datum.value / total) * 100) : 0;
          const bar = Math.max(2, (datum.value / max) * 100);

          return (
            <button
              key={`${index}-${datum.label}`}
              type="button"
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => setActiveIndex(index)}
              className={`grid w-full grid-cols-[56px_minmax(0,1fr)_88px_120px] items-center gap-3 px-4 py-4 text-left transition ${
                active ? "bg-brand-soft/70" : "bg-white hover:bg-surface-muted"
              }`}
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-brand text-sm font-black text-on-brand">
                {index + 1}
              </span>

              <span className="min-w-0">
                <span className="block truncate text-sm font-black text-ink" title={datum.label}>
                  {datum.label}
                </span>
                <span className="mt-2 block h-2 overflow-hidden rounded-full bg-edge">
                  <span
                    className="block h-full rounded-full transition-[width]"
                    style={{ width: `${bar}%`, backgroundColor: datum.color }}
                  />
                </span>
              </span>

              <span className="text-right font-display text-2xl font-black tracking-tight text-brand">
                {datum.value}
              </span>

              <span className="text-right">
                <span className="inline-flex min-w-14 justify-center rounded-full border border-edge bg-surface px-2.5 py-1 text-xs font-black text-ink">
                  {percent}%
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
