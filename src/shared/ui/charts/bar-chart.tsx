"use client";

import { useState } from "react";

export interface BarDatum {
  label: string;
  value: number;
  color: string;
}

export interface BarChartProps {
  data: BarDatum[];
}

export function BarChart({ data }: BarChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((sum, datum) => sum + datum.value, 0);
  const active = data[Math.min(activeIndex, data.length - 1)];

  if (data.length === 0) return null;

  return (
    <div className="w-full rounded-card border border-edge bg-[#082a6b] p-4 text-white shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/50">Distribucion</p>
          <p className="mt-1 text-sm font-bold text-white">Canales de contacto</p>
        </div>
        <div className="rounded-card border border-white/10 bg-white/8 px-3 py-2 text-right">
          <p className="text-[10px] font-bold uppercase tracking-wide text-white/45">Total</p>
          <p className="text-xl font-black">{total}</p>
        </div>
      </div>

      <div className="grid gap-2">
        {data.map((datum, index) => {
          const percent = Math.round((datum.value / max) * 100);
          const share = total > 0 ? Math.round((datum.value / total) * 100) : 0;
          const activeRow = activeIndex === index;

          return (
            <button
              key={datum.label}
              type="button"
              onClick={() => setActiveIndex(index)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`grid gap-2 rounded-card border px-3 py-3 text-left transition ${
                activeRow ? "border-white/20 bg-white/10" : "border-white/8 bg-white/[0.03] hover:bg-white/7"
              }`}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-xs font-black uppercase tracking-wide text-white/75">
                  {datum.label}
                </span>
                <span className="text-xs font-bold text-white/55">{share}%</span>
              </span>
              <span className="flex items-center gap-3">
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <span
                    className="block h-full rounded-full transition-[width]"
                    style={{ width: `${Math.max(3, percent)}%`, backgroundColor: datum.color }}
                  />
                </span>
                <span className="w-10 text-right text-lg font-black text-white">{datum.value}</span>
              </span>
            </button>
          );
        })}
      </div>

      {active ? (
        <div className="mt-4 rounded-card border border-white/10 bg-white/[0.04] px-3 py-2">
          <p className="text-[10px] font-black uppercase tracking-wide text-white/45">Canal activo</p>
          <p className="mt-0.5 text-sm font-bold text-white">
            {active.label}: {active.value} consultas
          </p>
        </div>
      ) : null}
    </div>
  );
}
