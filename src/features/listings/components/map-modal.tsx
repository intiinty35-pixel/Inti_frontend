"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
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
 * Si el historial tiene entradas propias podemos "cerrar" retrocediendo (asi el
 * boton Atras del navegador vuelve a la lista de resultados, como una pantalla)
 * y al salir limpiamos esa entrada para no dejar basura en el historial.
 */
type CloseMode = "history" | "state";

/**
 * Mapa a pantalla grande.
 *
 * No es un modal centrado: ocupa todo el viewport como una vista propia. En
 * escritorio el mapa usa el ancho completo y la lista de propiedades va en una
 * columna lateral de 360px; en movil la barra de filtros se va arriba y el mapa
 * ocupa el resto, con la lista plegada por debajo (el panel decide el orden con
 * flex/grid, aqui solo se le da todo el alto disponible).
 *
 * No reimplementa nada: renderiza el mismo `ListingsMapPanel` de la pagina con
 * `variant="overlay"`, asi los filtros, el contador, los pines y la lista lateral
 * siguen siendo exactamente los de hoy.
 *
 * Montaje: `createPortal` directo en el render (la vista solo se monta tras un
 * clic, nunca en SSR) y la entrada se resuelve con animaciones CSS, sin setState
 * dentro de efectos.
 */
export function MapModal({ points, filters, isProjectMode, onClose }: MapModalProps) {
  // Resto de la pagina (cabecera, resultados, pie, flotantes): con el mapa
  // ocupando todo el viewport no debe ser alcanzable con el tabulador.
  const shellRef = useRef<HTMLElement | null>(null);

  /**
   * Esc y el boton Atras cierran. El listener de `popstate` se registra en el
   * callback del estado (no dentro del body del efecto) porque el historial solo
   * se toca al abrir: si el navegador trae `history.state` de otra pantalla,
   * tocarlo al montar romperia su navegacion.
   */
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Aislamiento del fondo: la vista es lo unico que debe poder leerse/recorrerse.
    shellRef.current = document.getElementById("ariz-public-shell");
    const previousAriaHidden = shellRef.current?.getAttribute("aria-hidden") ?? null;
    shellRef.current?.setAttribute("inert", "");
    shellRef.current?.setAttribute("aria-hidden", "true");

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      if (history.state?.arizMapOpen) {
        history.back();
      } else {
        onClose();
      }
    }

    function onPopState() {
      if (!history.state?.arizMapOpen) onClose();
    }

    const closeMode: CloseMode = history.state?.arizMapOpen ? "state" : "history";

    if (closeMode === "history") {
      history.pushState({ ...history.state, arizMapOpen: true }, "");
      window.addEventListener("popstate", onPopState);
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);

      shellRef.current?.removeAttribute("inert");
      if (previousAriaHidden === null) {
        shellRef.current?.removeAttribute("aria-hidden");
      } else {
        shellRef.current?.setAttribute("aria-hidden", previousAriaHidden);
      }

      if (closeMode === "state") {
        // Entrada nuestra todavia viva: la quitamos sin disparar popstate.
        history.replaceState({ ...history.state, arizMapOpen: undefined }, "");
      } else {
        window.removeEventListener("popstate", onPopState);
      }
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mapa de propiedades"
      className="ariz-map-view fixed inset-0 z-60 flex flex-col bg-canvas"
    >
      <header className="flex shrink-0 items-center gap-3 border-b border-edge bg-surface px-4 py-3 lg:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <PinIcon className="size-4 shrink-0 text-brand" />
          <h2 className="truncate text-sm font-bold text-ink lg:text-base">Mapa de propiedades</h2>
          <span className="hidden text-xs font-semibold text-muted sm:inline">
            {points.length === 1 ? "1 propiedad" : `${points.length} propiedades`}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="ml-auto flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-edge px-3.5 text-xs font-bold text-muted transition-colors hover:border-brand hover:text-brand"
        >
          <XIcon className="size-4" />
          Volver a la lista
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col p-3 lg:p-5">
        <ListingsMapPanel
          points={points}
          filters={filters}
          isProjectMode={isProjectMode}
          variant="overlay"
        />
      </div>
    </div>,
    document.body,
  );
}
