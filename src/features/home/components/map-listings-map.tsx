"use client";

import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { useEffect, useRef, type RefObject } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

export interface MapListingMarker {
  id: string;
  href: string;
  kind: "property" | "project";
  title: string;
  district: string;
  price: string;
  lat: number;
  lng: number;
}

const DEFAULT_CENTER: [number, number] = [-12.046374, -77.042793];

const propertyMarkerIcon = new L.DivIcon({
  className: "",
  html: '<span class="block size-6 rounded-full border-[3px] border-white bg-brand shadow-[0_8px_20px_rgb(0_18_79/0.35)] ring-4 ring-brand/20"></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const projectMarkerIcon = new L.DivIcon({
  className: "",
  html: '<span class="block size-6 rounded-full border-[3px] border-white bg-accent shadow-[0_8px_20px_rgb(0_18_79/0.35)] ring-4 ring-accent/30"></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function FitMarkers({ markers }: { markers: MapListingMarker[] }) {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds(markers.map((marker) => [marker.lat, marker.lng]));
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 14, animate: false });
  }, [map, markers]);

  return null;
}

function MapResize({ containerRef }: { containerRef: RefObject<HTMLDivElement | null> }) {
  const map = useMap();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => map.invalidateSize({ animate: false }));
    observer.observe(container);
    const frame = requestAnimationFrame(() => map.invalidateSize({ animate: false }));

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [containerRef, map]);

  return null;
}

export function MapListingsMap({ markers }: { markers: MapListingMarker[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative h-[420px] overflow-hidden rounded-card border border-edge bg-surface-muted">
      <MapContainer center={DEFAULT_CENTER} zoom={11} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          keepBuffer={4}
          updateWhenIdle={false}
        />
        <FitMarkers markers={markers} />
        <MapResize containerRef={containerRef} />
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            icon={marker.kind === "project" ? projectMarkerIcon : propertyMarkerIcon}
            position={[marker.lat, marker.lng]}
          >
            <Popup>
              <div className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wide text-muted">
                  {marker.kind === "project" ? "Proyecto" : "Propiedad"}
                </span>
                <span className="font-bold text-brand">{marker.price}</span>
                <span className="max-w-52 text-xs font-semibold text-ink">{marker.title}</span>
                <span className="text-xs text-muted">{marker.district}</span>
                <Link href={marker.href} className="mt-1 text-xs font-bold text-brand underline">
                  {marker.kind === "project" ? "Ver proyecto" : "Ver propiedad"}
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <span className="pointer-events-none absolute top-4 right-4 z-[400] rounded-full bg-surface px-3 py-1.5 text-[11px] font-bold text-brand shadow-[var(--shadow-card)]">
        {markers.length} {markers.length === 1 ? "publicación" : "publicaciones"}
      </span>
    </div>
  );
}
