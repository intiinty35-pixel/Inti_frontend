"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Maximize } from "lucide-react";
import { PinIcon } from "@/shared/ui/icons";
import { cn } from "@/shared/lib/cn";
import type { MapPoint } from "@/features/listings/components/listings-map";

/**
 * La miniatura usa el mismo mapa Leaflet real en modo no interactivo
 * (`interactive={false}`): asi los pines y el encuadre salen gratis y
 * cualquier ajuste futuro del mapa se refleja tambien aqui.
 */
const MapPreview = dynamic<{
  points: readonly MapPoint[];
  className?: string;
}>(
  () =>
    import("@/features/listings/components/listings-map").then((module) => {
      // Adaptador: el mapa recibe las props completas, la miniatura solo dos.
      const Inner = ({ points, className }: { points: readonly MapPoint[]; className?: string }) => (
        <module.ListingsMap
          points={points}
          className={className}
          interactive={false}
          compactPins
        />
      );
      return Inner;
    }),
  { ssr: false, loading: () => <PreviewSkeleton /> },
);

/** Esqueleto mientras Leaflet (mapa y tiles) termina de cargar. */
function PreviewSkeleton() {
  return (
    <div className="h-full w-full animate-pulse bg-surface-muted">
      <div className="flex h-full items-center justify-center">
        <PinIcon className="size-8 text-brand/20" />
      </div>
    </div>
  );
}

export interface MapPreviewCardProps {
  /** Propiedades del filtro activo: alimentan el contador y los pines. */
  points: readonly MapPoint[];
  /** Abre el mapa a pantalla completa. */
  onOpen: () => void;
  /** true mientras llegan los datos del servidor (esqueleto). */
  isLoading?: boolean;
  className?: string;
  /** "Popiedades" en el buscador; "Proyectos" en el listado de proyectos. */
  countLabel?: string;
  /**
   * `sidebar` (por defecto): retrato en la columna lateral. `header`: banda ancha
   * y baja en el encabezado del listado, con las acciones centradas.
   */
  layout?: "sidebar" | "header";
}

/**
 * Vista previa del mapa en formato retrato, pensada para la columna derecha del
 * buscador. No es interactiva: toda la card es un unico boton accesible que abre
 * el mapa completo. Tambien se reutiliza como banner horizontal en tablet.
 */
export function MapPreviewCard({
  points,
  onOpen,
  isLoading = false,
  className,
  countLabel = "propiedad",
  layout = "sidebar",
}: MapPreviewCardProps) {
  const [focused, setFocused] = useState(false);
  const hasPoints = points.length > 0;
  const disabled = isLoading || !hasPoints;
  const isHeader = layout === "header";

  /** Mensaje visible: mismo dato que el contador "N en el mapa" del panel. */
  const counterLabel = useMemo(() => {
    if (!hasPoints) return "Sin resultados en el mapa";
    return points.length === 1
      ? `1 ${countLabel} en el mapa`
      : `${points.length} ${countLabel}s en el mapa`;
  }, [countLabel, hasPoints, points.length]);

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onOpen}
      disabled={disabled}
      aria-label="Abrir mapa de propiedades"
      aria-haspopup="dialog"
      className={cn(
        "group relative block w-full overflow-hidden rounded-2xl border border-edge bg-surface text-left shadow-[var(--shadow-card)] transition",
        // Relacion retrato en la columna lateral; el encabezado del listado fija
        // su propia altura con `className`.
        !isHeader && "aspect-[4/5]",
        disabled
          ? "cursor-not-allowed opacity-95"
          : "cursor-pointer hover:-translate-y-1 hover:border-brand/30 hover:shadow-[var(--shadow-pop)]",
        focused && "ring-2 ring-brand/40 ring-offset-2",
        className,
      )}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {/* Miniatura del mapa: pines reales de las propiedades filtradas. */}
      <span className="absolute inset-0 block overflow-hidden">
        {isLoading ? (
          <PreviewSkeleton />
        ) : hasPoints ? (
          <span className="block h-full w-full transition-transform duration-500 group-hover:scale-105">
            <MapPreview points={points} className="h-full w-full" />
          </span>
        ) : (
          <span className="flex h-full w-full flex-col items-center justify-center gap-2 bg-surface-muted p-6 text-center">
            <PinIcon className="size-8 text-brand/30" />
            <span className="text-sm font-bold text-ink">Sin resultados en el mapa</span>
            <span className="text-xs text-muted">
              Prueba quitando el distrito o ampliando el rango de precio.
            </span>
          </span>
        )}
      </span>

      {/* Overlay inferior con degradado azul marino y contador. */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand via-brand/70 to-transparent",
          isHeader ? "h-3/5" : "h-2/5",
        )}
      />

      <span
        className={cn(
          "absolute inset-x-0 bottom-0 flex flex-col gap-2.5 p-4",
          isHeader && "items-center text-center",
        )}
      >
        <span className="flex items-center gap-1.5 text-xs font-bold text-white">
          <PinIcon className="size-4 shrink-0 text-accent" />
          Ver en el mapa
        </span>

        <span className="text-[11px] font-semibold text-white/80">{counterLabel}</span>

        <span
          className={cn(
            "flex h-10 items-center justify-center gap-2 rounded-card px-4 text-xs font-bold transition-colors",
            disabled
              ? "bg-white/25 text-white/70"
              : "bg-brand text-on-brand group-hover:bg-brand-hover",
          )}
        >
          <Maximize className="size-4" aria-hidden />
          Abrir mapa
        </span>
      </span>
    </button>
  );
}
