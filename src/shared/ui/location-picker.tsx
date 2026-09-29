"use client";

import dynamic from "next/dynamic";
import type { LocationPickerProps } from "@/shared/ui/leaflet-location-picker";

const MapSkeleton = () => <div className="h-80 w-full rounded-card border border-edge bg-surface-muted" />;

export const preloadLocationPicker = () => import("@/shared/ui/leaflet-location-picker");

const LeafletLocationPicker = dynamic<LocationPickerProps>(
  () => preloadLocationPicker().then((module) => module.LeafletLocationPicker),
  { ssr: false, loading: MapSkeleton },
);

export function LocationPicker(props: LocationPickerProps) {
  return <LeafletLocationPicker {...props} />;
}

export type { LocationPickerProps, MapPoint } from "@/shared/ui/leaflet-location-picker";
