"use client";

import dynamic from "next/dynamic";
import type { LocationPickerProps } from "./leaflet-map";

const MapSkeleton = () => <div className="h-80 w-full rounded-card border border-edge bg-surface-muted" />;

export const preloadLocationPicker = () => import("./leaflet-map");

const LeafletMap = dynamic<LocationPickerProps>(
  () => preloadLocationPicker().then((module) => module.LeafletMap),
  { ssr: false, loading: MapSkeleton },
);

export function LocationPicker(props: LocationPickerProps) {
  return <LeafletMap {...props} />;
}
