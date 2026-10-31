"use client";

import { useEffect, useState } from "react";
import { ChevronDownIcon, SearchIcon, XIcon } from "@/shared/ui/icons";
import { HomeHeroClient } from "@/features/home/components/home-hero-client";
import { SearchForm } from "@/features/search";
import type { CurrentPromotion } from "@/features/promotions/types";

/** Hero del home con el acceso de búsqueda justo debajo del header. */
export function HeroSearchSection({ promotions }: { promotions: CurrentPromotion[] }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <>
      <div className="absolute top-[calc(var(--header-h)+0.25rem)] left-1/2 z-40 flex -translate-x-1/2 flex-col items-center">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Buscar propiedad"
          aria-expanded={isOpen}
          aria-controls="buscador-hero"
          className="inline-flex items-center justify-center gap-2 text-sm font-black whitespace-nowrap text-white drop-shadow-[0_1px_3px_rgb(0_0_0_/_0.9)] transition-colors hover:text-accent focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <span className="underline decoration-white/75 decoration-1 underline-offset-4">Buscar propiedad</span>
          <SearchIcon className="hero-search-nudge size-[18px]" />
        </button>
        <ChevronDownIcon aria-hidden className="hero-search-pointer -mt-0.5 size-5 text-white drop-shadow-[0_1px_3px_rgb(0_0_0_/_0.8)]" />
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-3 sm:p-6">
          <button
            type="button"
            aria-label="Cerrar búsqueda"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
          />
          <section
            id="buscador-hero"
            role="dialog"
            aria-modal="true"
            aria-label="Buscar propiedades"
            className="relative z-10 my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-[960px] overflow-x-hidden overflow-y-auto overscroll-contain rounded-2xl border border-edge bg-surface p-5 shadow-[var(--shadow-pop)] sm:max-h-[calc(100dvh-3rem)] sm:p-7"
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar búsqueda"
              className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink"
            >
              <XIcon className="size-5" />
            </button>
            <h2 className="mb-4 pr-10 font-display text-xl font-black text-brand sm:text-2xl">
              Encuentra tu próxima propiedad
            </h2>
            <SearchForm />
          </section>
        </div>
      ) : null}

      <HomeHeroClient promotions={promotions} />
    </>
  );
}
