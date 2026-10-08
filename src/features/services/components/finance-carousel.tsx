"use client";

import { useEffect, useState } from "react";
import {
  Banknote,
  Calculator,
  ChartNoAxesCombined,
  FileBarChart,
  Landmark,
  ReceiptText,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const FINANCE_ICONS: Record<string, LucideIcon> = {
  "Evaluacion tributaria": ReceiptText,
  "Costos del proyecto": Calculator,
  "Flujo de caja": Banknote,
  Rentabilidad: TrendingUp,
  SUNAT: Landmark,
  "Reportes financieros": FileBarChart,
  "Estructuracion financiera": ChartNoAxesCombined,
};

export function FinanceCarousel({ items }: { items: readonly string[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % items.length);
    }, 2400);

    return () => window.clearInterval(id);
  }, [items.length]);

  return (
    <div className="overflow-hidden">
      <div
        className="flex gap-3 transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${active * 11.75}rem)` }}
      >
        {[...items, ...items].map((item, index) => (
          <FinanceItem key={`${item}-${index}`} item={item} />
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-1.5">
        {items.map((item, index) => (
          <button
            key={item}
            type="button"
            aria-label={`Ver ${item}`}
            onClick={() => setActive(index)}
            className={`h-1.5 rounded-full transition-all ${
              active % items.length === index ? "w-6 bg-brand" : "w-2 bg-edge"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function FinanceItem({ item }: { item: string }) {
  const Icon = FINANCE_ICONS[item] ?? FileBarChart;

  return (
    <div className="group flex min-h-32 w-44 shrink-0 flex-col justify-between rounded-card border border-edge bg-canvas p-4 shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:border-brand">
      <span className="flex size-10 items-center justify-center rounded-card bg-brand text-accent shadow-[0_10px_22px_rgb(7_26_90_/_0.16)] transition-colors group-hover:bg-accent group-hover:text-on-accent">
        <Icon className="size-5" strokeWidth={2.3} aria-hidden="true" />
      </span>
      <p className="mt-5 text-base font-black leading-5 text-brand">{item}</p>
    </div>
  );
}
