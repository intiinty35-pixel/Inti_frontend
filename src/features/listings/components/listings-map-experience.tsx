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
  /**
   * `sidebar` (por defecto, usado por Propiedades): la vista previa vive en la
   * columna lateral del listado. `header` (usado por Proyectos): Proyectos se
   * muestra en tarjetas a todo lo ancho, asi que el mapa va arriba, a ancho
   * completo, con los filtros de busqueda ya aplicados en la pagina.
   */
  layout?: "sidebar" | "header";
}

/**
 * Orquesta las formas del mapa del buscador sin duplicar logica:
 *
 * - Escritorio: columna lateral sticky con la vista previa en retrato.
 * - Escritorio (vista amplia): panel de mapa embebido y sincronizado con la
 *   busqueda; los filtros de arriba son los mismos del panel.
 * - Tablet ancha: cabecera con filtros + mapa y, debajo, la lista en tarjetas.
 * - Movil: boton flotante "Mapa"; la vista a pantalla completa lleva los filtros
 *   en una franja con scroll horizontal y la lista de inmuebles debajo del mapa.
 *
 * Al abrir/cerrar la vista completa, los filtros, el scroll de la pagina y la
 * posicion de la lista se conservan: la lista de cards nunca se desmonta.
 */
export function ListingsMapExperience({
  points,
  filters,
  isProjectMode,
  layout = "sidebar",
}: ListingsMapExperienceProps) {
  const [open, setOpen] = useState(false);
  const hasPoints = points.length > 0;
  const isHeader = layout === "header";

  return (
    <>
      {/* `header`: mapa a ancho completo arriba de la grilla de proyectos. */}
      {isHeader ? (
        <div className="w-full">
          <MapPreviewCard
            points={points}
            onOpen={() => setOpen(true)}
            layout="header"
            countLabel={isProjectMode ? "proyecto" : "propiedad"}
            className="aspect-auto h-52 sm:h-64 lg:h-72"
          />
        </div>
      ) : (
        /* Vista previa: banner horizontal en tablet, retrato sticky en escritorio. */
        <div className="lg:sticky lg:top-24">
          <MapPreviewCard
            points={points}
            onOpen={() => setOpen(true)}
            className="max-lg:aspect-auto max-lg:h-40"
          />
        </div>
      )}

      <div className="flex justify-center py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={!hasPoints}
          aria-label="Abrir mapa de propiedades"
          aria-haspopup="dialog"
          className={cn(
            "flex h-11 items-center gap-2 rounded-full px-5 text-sm font-bold shadow-[var(--shadow-pop)] transition-colors",
            hasPoints
              ? "bg-brand text-on-brand hover:bg-brand-hover"
              : "cursor-not-allowed bg-ink/40 text-white/70",
          )}
        >
          <PinIcon className="size-4" />
          Mapa
        </button>
      </div>

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
