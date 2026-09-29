"use client";

import { useState } from "react";
import { PinIcon } from "@/shared/ui/icons";
import { cn } from "@/shared/lib/cn";
import type { MapPoint } from "@/features/listings/components/listings-map";
import { MapPreviewCard } from "@/features/listings/components/map-preview-card";
import { MapModal } from "@/features/listings/components/map-modal";
import type { ListingsMapPanelProps } from "@/features/listings/components/listings-map-panel";

export interface ListingsMapExperienceProps {
  points: readonly MapPoint[];
  filters: ListingsMapPanelProps["filters"];
  isProjectMode: boolean;
}

/**
 * Orquesta las tres formas del mapa del buscador sin duplicar logica:
 *
 * - Escritorio: columna derecha sticky con la vista previa en retrato.
 * - Tablet: la misma vista previa como banner horizontal arriba de la lista.
 * - Movil: boton flotante "Mapa"; la preview se oculta y el modal abre a pantalla
 *   completa con la lista en hoja inferior.
 *
 * Al abrir/cerrar el modal, los filtros, el scroll de la pagina y la posicion de
 * la lista se conservan: la lista de cards nunca se desmonta.
 */
export function ListingsMapExperience({
  points,
  filters,
  isProjectMode,
}: ListingsMapExperienceProps) {
  const [open, setOpen] = useState(false);
  const hasPoints = points.length > 0;

  return (
    <>
      {/* Vista previa: banner horizontal en tablet, retrato sticky en escritorio. */}
      <div className="lg:sticky lg:top-24">
        <MapPreviewCard
          points={points}
          onOpen={() => setOpen(true)}
          className="max-lg:aspect-auto max-lg:h-40"
        />
      </div>

      {/* Boton flotante movil: subido sobre WhatsApp y Asistente para no taparlos. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!hasPoints}
        aria-label="Abrir mapa de propiedades"
        aria-haspopup="dialog"
        className={cn(
          "fixed bottom-25 left-1/2 z-50 flex h-11 -translate-x-1/2 items-center gap-2 rounded-full px-5 text-sm font-bold shadow-[var(--shadow-pop)] transition-colors lg:hidden",
          hasPoints
            ? "bg-brand text-on-brand hover:bg-brand-hover"
            : "cursor-not-allowed bg-ink/40 text-white/70",
        )}
      >
        <PinIcon className="size-4" />
        Mapa
      </button>

      {open ? (
        <MapModal
          points={points}
          filters={filters}
          isProjectMode={isProjectMode}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
