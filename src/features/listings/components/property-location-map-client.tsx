"use client";

import dynamic from "next/dynamic";
import type { PropertyLocationMapProps } from "./property-location-map";

export type LazyPropertyLocationMapProps = PropertyLocationMapProps;

const MapSkeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-card border border-edge bg-surface-muted ${className ?? "h-80 w-full"}`} />
);

const PropertyLocationMap = dynamic<PropertyLocationMapProps>(
  () => import("./property-location-map").then((module) => module.PropertyLocationMap),
  { ssr: false, loading: () => <MapSkeleton /> },
);

/**
 * Leaflet necesita `window`, por eso el mapa del detalle publico se monta solo en
 * el cliente. El alto se define desde la pagina para que el placeholder ocupe el
 * mismo espacio y no haya salto de layout.
 */
export function LazyPropertyLocationMap({ ...props }: LazyPropertyLocationMapProps) {
  if (!Number.isFinite(props.latitude) || !Number.isFinite(props.longitude)) {
    return null;
  }

  return (
    <div className={props.className}>
      <PropertyLocationMap {...props} className="h-full w-full" />
    </div>
  );
}
