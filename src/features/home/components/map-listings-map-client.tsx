"use client";

import dynamic from "next/dynamic";
import { MapIcon } from "@/shared/ui/icons";
import type { MapListingMarker } from "@/features/home/components/map-listings-map";

export type { MapListingMarker } from "@/features/home/components/map-listings-map";

const MapSkeleton = () => (
  <div className="h-[420px] w-full animate-pulse rounded-card border border-edge bg-surface-muted lg:h-[560px] xl:h-[640px]" />
);

const LeafletMap = dynamic(
  () => import("@/features/home/components/map-listings-map").then((module) => module.MapListingsMap),
  { ssr: false, loading: MapSkeleton },
);

export function MapListingsMapClient({
  markers,
  mapHref,
}: {
  markers: MapListingMarker[];
  mapHref?: string;
}) {
  if (markers.length === 0) {
    return (
      <div className="flex h-[420px] flex-col items-center justify-center gap-3 rounded-card border border-dashed border-edge bg-surface-muted px-6 text-center text-sm text-muted lg:h-[560px] xl:h-[640px]">
        <MapIcon className="size-8 text-brand" />
        <p>No hay propiedades con ubicación disponible para mostrar en el mapa.</p>
      </div>
    );
  }

  return <LeafletMap markers={markers} mapHref={mapHref} />;
}
