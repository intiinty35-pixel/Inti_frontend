"use client";

import { useEffect, useState } from "react";

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
          <div
            key={`${item}-${index}`}
            className="group flex min-h-32 w-44 shrink-0 flex-col justify-between rounded-card border border-edge bg-canvas p-4 shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:border-brand"
          >
            <span className="size-2.5 rounded-full bg-accent shadow-[0_0_0_4px_rgb(245_184_0_/_0.12)]" />
            <p className="mt-5 text-base font-black leading-5 text-brand">{item}</p>
          </div>
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
