"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
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

/** Icono de expandir (pantalla completa), en linea con el resto de los iconos. */
function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M9 4H4v5M15 4h5v5M15 20h5v-5M9 20H4v-5" />
    </svg>
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
}: MapPreviewCardProps) {
  const [focused, setFocused] = useState(false);
  const hasPoints = points.length > 0;
  const disabled = isLoading || !hasPoints;

  /** Mensaje visible: mismo dato que el contador "N en el mapa" del panel. */
  const counterLabel = useMemo(() => {
    if (!hasPoints) return "Sin propiedades en el mapa";
    return points.length === 1
      ? "1 propiedad en el mapa"
      : `${points.length} propiedades en el mapa`;
  }, [hasPoints, points.length]);

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onOpen}
      disabled={disabled}
      aria-label="Abrir mapa de propiedades"
      aria-haspopup="dialog"
      className={cn(
        "group relative block w-full overflow-hidden rounded-2xl border border-edge bg-surface text-left shadow-[var(--shadow-card)] transition",
        // Relacion retrato en la columna lateral; banda corta en el banner de tablet.
        "aspect-[4/5]",
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
            <span className="text-sm font-bold text-ink">Sin propiedades en el mapa</span>
            <span className="text-xs text-muted">
              Prueba quitando el distrito o ampliando el rango de precio.
            </span>
          </span>
        )}
      </span>

      {/* Overlay inferior con degradado azul marino y contador. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-brand via-brand/70 to-transparent"
      />

      <span className="absolute inset-x-0 bottom-0 flex flex-col gap-2.5 p-4">
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
          <ExpandIcon className="size-4" />
          Abrir mapa
        </span>
      </span>
    </button>
  );
}
