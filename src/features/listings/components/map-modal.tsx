"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { PinIcon, XIcon } from "@/shared/ui/icons";
import type { MapPoint } from "@/features/listings/components/listings-map";
import type { ListingsMapPanelProps } from "@/features/listings/components/listings-map-panel";

/**
 * El panel real se carga solo al abrir el mapa (lazy load): la pagina de
 * resultados no paga el costo de Leaflet hasta que el usuario lo pide.
 */
const ListingsMapPanel = dynamic<ListingsMapPanelProps>(
  () =>
    import("@/features/listings/components/listings-map-panel").then(
      (module) => module.ListingsMapPanel,
    ),
  { ssr: false, loading: () => <MapOverlaySkeleton /> },
);

/** Esqueleto del area de mapa mientras se descarga el panel interactivo. */
function MapOverlaySkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-1 items-center justify-center gap-2 rounded-card border border-edge bg-surface-muted">
      <PinIcon className="size-8 text-brand/30" />
      <p className="text-sm font-bold text-muted">Cargando mapa…</p>
    </div>
  );
}

export interface MapModalProps {
  points: readonly MapPoint[];
  filters: ListingsMapPanelProps["filters"];
  isProjectMode: boolean;
  onClose: () => void;
}

/**
 * Mapa a pantalla completa.
 *
 * Desktop: modal centrado con animacion de escala + fade. Movil: hoja inferior
 * (bottom sheet) que ocupa el 90% del alto, para que el mapa quede arriba y la
 * lista lateral se pueda recorrer por debajo.
 *
 * No reimplementa nada: renderiza el mismo `ListingsMapPanel` de la pagina con
 * `variant="overlay"`, asi los filtros, el contador, los pines y la lista lateral
 * siguen siendo exactamente los de hoy.
 *
 * Montaje: `createPortal` directo en el render (el modal solo se monta tras un
 * clic, nunca en SSR) y la entrada se resuelve con animaciones CSS, sin
 * setState dentro de efectos.
 */
export function MapModal({ points, filters, isProjectMode, onClose }: MapModalProps) {
  // Esc cierra y bloqueamos el scroll del body mientras el mapa esta abierto.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mapa de propiedades"
      className="fixed inset-0 z-60 flex items-end justify-center sm:items-center sm:p-6"
    >
      {/* Fondo: clic fuera cierra. */}
      <div
        aria-hidden
        onClick={onClose}
        className="ariz-fade-in absolute inset-0 bg-ink/60 backdrop-blur-[2px]"
      />

      <div className="ariz-modal-in relative flex h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl border border-edge bg-canvas shadow-[var(--shadow-pop)] sm:h-auto sm:max-h-[92vh] sm:max-w-6xl sm:rounded-2xl">
        <header className="relative flex items-center justify-between gap-3 border-b border-edge bg-surface px-4 py-3">
          {/* Asa decorativa del bottom sheet en movil. */}
          <span
            aria-hidden
            className="absolute inset-x-0 top-1 mx-auto h-1 w-10 rounded-full bg-edge sm:hidden"
          />
          <div className="flex items-center gap-2">
            <PinIcon className="size-4 shrink-0 text-brand" />
            <h2 className="text-sm font-bold text-ink">Mapa de propiedades</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar mapa"
            className="flex size-9 items-center justify-center rounded-full border border-edge text-muted transition-colors hover:border-brand hover:text-brand"
          >
            <XIcon className="size-4" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-4">
          <ListingsMapPanel
            points={points}
            filters={filters}
            isProjectMode={isProjectMode}
            variant="overlay"
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
