"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

export interface PropertyLocationMapProps {
  latitude: number;
  longitude: number;
  /** Zoom inicial: 17 muestra la manzana, 15 el barrio (ubicacion aproximada). */
  zoom?: number;
  label?: string;
  className?: string;
}

const markerIcon = new L.DivIcon({
  className: "",
  html: '<span class="block size-6 rounded-full border-[3px] border-white bg-brand shadow-[0_8px_20px_rgb(0_18_79/0.35)] ring-4 ring-brand/20"></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

/** Mantiene el mapa centrado si cambian las coordenadas (navegacion entre anuncios). */
function MapSync({ latitude, longitude, zoom }: { latitude: number; longitude: number; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], zoom, { animate: true });
  }, [latitude, longitude, zoom, map]);

  return null;
}

/**
 * El detalle de propiedad se renderiza dentro de un layout que puede medir el
 * contenedor despues del primer frame (fuentes, imagenes). Leaflet solo mide una
 * vez al montar, asi que avisamos con un ResizeObserver para que recalcule tiles.
 */
function MapResize({ containerRef }: { containerRef: RefObject<HTMLDivElement | null> }) {
  const map = useMap();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      map.invalidateSize({ animate: false });
    });
    observer.observe(container);

    const frame = requestAnimationFrame(() => map.invalidateSize({ animate: false }));

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [containerRef, map]);

  return null;
}

/**
 * Mapa de solo lectura para el detalle publico de una propiedad: muestra donde
 * esta el inmueble sin permitir mover el marcador (eso es exclusivo del wizard).
 */
export function PropertyLocationMap({
  latitude,
  longitude,
  zoom = 17,
  label,
  className = "h-80 w-full",
}: PropertyLocationMapProps) {
  const center = useMemo<[number, number]>(() => [latitude, longitude], [latitude, longitude]);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className={`overflow-hidden rounded-card border border-edge bg-surface-muted ${className}`}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          keepBuffer={4}
          updateWhenIdle={false}
        />
        <MapSync latitude={latitude} longitude={longitude} zoom={zoom} />
        <MapResize containerRef={containerRef} />
        <Marker icon={markerIcon} position={center}>
          {label ? <Popup>{label}</Popup> : null}
        </Marker>
      </MapContainer>
    </div>
  );
}
