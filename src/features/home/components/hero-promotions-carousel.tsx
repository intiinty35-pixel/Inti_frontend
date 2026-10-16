"use client";

import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/cn";
import type { CurrentPromotion } from "@/features/promotions/types";

const INTERVAL_MS = 5000;

/** Carrusel de promociones vigentes: avanza solo y respeta prefers-reduced-motion. */
export function HeroPromotionsCarousel({ promotions }: { promotions: CurrentPromotion[] }) {
  const total = promotions.length;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (total < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % total), INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [total]);

  return (
    <div className="pointer-events-auto">
      <div className="relative aspect-[2/1] w-full overflow-hidden rounded-card shadow-[0_28px_55px_rgb(0_0_0_/_0.28)]">
        {promotions.map((promotion, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- imagen externa (Cloudinary)
          <img
            key={promotion.id}
            src={promotion.imageUrl}
            alt={promotion.title}
            className={cn(
              "absolute inset-0 size-full object-cover transition-opacity duration-700",
              i === index ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
      </div>

      {total > 1 ? (
        <div className="mt-3 flex justify-center gap-2">
          {promotions.map((promotion, i) => (
            <button
              key={promotion.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ver promoción ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "h-2 rounded-full transition-all",
                i === index ? "w-6 bg-accent" : "w-2 bg-white/60 hover:bg-white",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
