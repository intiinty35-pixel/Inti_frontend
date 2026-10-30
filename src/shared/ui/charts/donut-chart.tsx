"use client";

import { useState } from "react";

export interface DonutDatum {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  data: DonutDatum[];
  centerLabel?: string;
}

const SIZE = 210;
const STROKE = 22;
const ACTIVE_STROKE = STROKE + 4;
const RADIUS = (SIZE - ACTIVE_STROKE) / 2 - 2;
const CIRC = 2 * Math.PI * RADIUS;

export function DonutChart({ data, centerLabel = "total" }: DonutChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = data.reduce((sum, datum) => sum + datum.value, 0);
  const hasData = total > 0;
  const active = data[Math.min(activeIndex, data.length - 1)];
  let offset = 0;

  return (
    <div className="grid w-full gap-4 sm:grid-cols-[minmax(130px,150px)_minmax(0,1fr)] sm:items-center">
      <div className="relative mx-auto">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-32 sm:size-36 md:size-40" role="img" aria-label={`Distribucion ${centerLabel}`}>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#e5e2db" strokeWidth={STROKE} />
          {hasData
            ? data.map((datum, index) => {
                const length = (datum.value / total) * CIRC;
                const currentOffset = offset;
                offset += length;
                return (
                  <circle
                    key={datum.label}
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    stroke={datum.color}
                    strokeWidth={activeIndex === index ? ACTIVE_STROKE : STROKE}
                    strokeDasharray={`${length} ${CIRC - length}`}
                    strokeDashoffset={-currentOffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => setActiveIndex(index)}
                  />
                );
              })
            : null}
          <text x={SIZE / 2} y={SIZE / 2 - 3} textAnchor="middle" fontSize="30" fontWeight="900" fill="#082a6b">
            {total}
          </text>
          <text x={SIZE / 2} y={SIZE / 2 + 17} textAnchor="middle" fontSize="10" fontWeight="800" fill="#667085">
            {centerLabel}
          </text>
        </svg>
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted">Distribucion por canal</p>
        <p className="mt-1 truncate text-sm font-bold text-ink">
          {active ? `${active.label}: ${active.value} consultas` : "Sin datos"}
        </p>
        <ul className="mt-3 grid gap-2">
          {data.map((datum, index) => {
            const percent = total > 0 ? Math.round((datum.value / total) * 100) : 0;
            return (
              <li key={datum.label} className="min-w-0">
                <button
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => setActiveIndex(index)}
                  className={`relative flex w-full items-center gap-2.5 rounded-card border py-1.5 pr-10 pl-2.5 text-left transition ${
                    activeIndex === index ? "border-brand bg-brand-soft" : "border-edge bg-surface hover:border-brand/50"
                  }`}
                >
                  <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: datum.color }} />
                  <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink">{datum.label}</span>
                  <span className="absolute right-2.5 text-xs font-black text-muted">{percent}%</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
