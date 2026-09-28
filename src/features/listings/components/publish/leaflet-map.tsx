"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import L, { type LeafletMouseEvent } from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

export interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onChange: (location: { latitude: number; longitude: number }) => void;
}

const markerIcon = new L.DivIcon({
  className: "",
  html: '<span class="block size-6 rounded-full border-[3px] border-white bg-brand shadow-[0_8px_20px_rgb(0_18_79/0.35)] ring-4 ring-brand/20"></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapSync({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], Math.max(map.getZoom(), 17), { animate: true });
  }, [latitude, longitude, map]);

  return null;
}

function MapEvents({ onChange }: Pick<LocationPickerProps, "onChange">) {
  useMapEvents({
    click(event: LeafletMouseEvent) {
      onChange({
        latitude: Number(event.latlng.lat.toFixed(7)),
        longitude: Number(event.latlng.lng.toFixed(7)),
      });
    },
  });
  return null;
}

/**
 * El paso de ubicacion se oculta con `hidden` (display:none) hasta que el usuario
 * navega a el, asi que Leaflet se inicializa midiendo su contenedor en 0x0 y deja
 * de cargar tiles. Este componente usa un ResizeObserver para avisarle a Leaflet
 * cada vez que el contenedor cambia de tamano (por ejemplo al mostrarse el paso).
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

    // El contenedor puede medir 0x0 al montar (paso oculto): reintenta en el
    // siguiente frame por si el layout aun no se resolvio.
    const frame = requestAnimationFrame(() => map.invalidateSize({ animate: false }));

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [containerRef, map]);

  return null;
}

export function LeafletMap({ latitude, longitude, onChange }: LocationPickerProps) {
  const center = useMemo<[number, number]>(() => [latitude, longitude], [latitude, longitude]);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="overflow-hidden rounded-card border border-edge">
      <MapContainer center={center} zoom={17} scrollWheelZoom className="h-80 w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          keepBuffer={4}
          updateWhenIdle={false}
        />
        <MapSync latitude={latitude} longitude={longitude} />
        <MapEvents onChange={onChange} />
        <MapResize containerRef={containerRef} />
        <Marker
          icon={markerIcon}
          position={center}
          draggable
          eventHandlers={{
            dragend(event) {
              const marker = event.target as L.Marker;
              const position = marker.getLatLng();
              onChange({
                latitude: Number(position.lat.toFixed(7)),
                longitude: Number(position.lng.toFixed(7)),
              });
            },
          }}
        />
      </MapContainer>
    </div>
  );
}
