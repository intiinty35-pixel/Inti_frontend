"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, type RefObject } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { ListingsMapCard, type MapPointCard } from "@/features/listings/components/listings-map-card";

export interface MapPoint extends MapPointCard {
  lat: number;
  lng: number;
}

export interface ListingsMapProps {
  points: readonly MapPoint[];
  /** Centro/zoom inicial de Bolivia cuando no hay puntos. */
  center?: [number, number];
  zoom?: number;
  className?: string;
  /** Id del punto activo (se sincroniza desde el listado lateral). */
  activeId?: string | null;
  onSelect?: (id: string) => void;
  /**
   * `false` convierte el mapa en una miniatura: sin zoom, sin arrastre, sin
   * controles y sin atribucion flotante. Se usa en la vista previa lateral y en
   * el banner horizontal de tablet, donde el mapa solo debe insinuar la zona.
   */
  interactive?: boolean;
  /** Pines compactos (solo el icono) para la vista previa. */
  compactPins?: boolean;
}

/** Encuadre de respaldo: Santa Cruz de la Sierra. */
const DEFAULT_CENTER: [number, number] = [-17.783333, -63.182126];
const DEFAULT_ZOOM = 11;

/** Icono de ubicación de INTI; las miniaturas conservan los puntos compactos. */
function buildPriceIcon(_priceLabel: string, active: boolean, compact: boolean) {
  const size = compact ? 28 : active ? 48 : 42;
  const anchor = compact ? 14 : active ? 46 : 40;

  return new L.Icon({
    iconUrl: "/web_v/ubicacion.png",
    iconSize: [size, size],
    iconAnchor: compact ? [anchor, anchor] : [size / 2, anchor],
    popupAnchor: [0, compact ? -anchor : -anchor],
    className: active ? "drop-shadow-[0_8px_14px_rgb(0_18_79/0.45)]" : "",
    alt: "Ubicación en el mapa",
  });
}

/** Encuadra el mapa para que todos los puntos entren en pantalla. */
function FitToPoints({
  points,
  emptyCenter,
}: {
  points: readonly MapPoint[];
  emptyCenter: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) {
      map.setView(emptyCenter, DEFAULT_ZOOM, { animate: false });
      return;
    }

    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 15, { animate: true });
      return;
    }

    map.fitBounds(
      L.latLngBounds(points.map((point) => [point.lat, point.lng] as [number, number])),
      { padding: [48, 48], maxZoom: 15 },
    );
  }, [points, emptyCenter, map]);

  return null;
}

/** Centra el mapa en el punto seleccionado desde el listado lateral. */
function FlyToActive({ point }: { point: MapPoint | undefined }) {
  const map = useMap();

  useEffect(() => {
    if (point) {
      map.flyTo([point.lat, point.lng], Math.max(map.getZoom(), 15), { duration: 0.6 });
    }
  }, [point, map]);

  return null;
}

/** Leaflet mide el contenedor una sola vez: avisamos con un ResizeObserver. */
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

/**
 * Mapa publico del buscador: dibuja todos los inmuebles del filtro activo. Cada
 * punto abre una card con portada, precio y accesos directos a ver el detalle o
 * escribir por WhatsApp.
 */
export function ListingsMap({
  points,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  className = "h-full w-full",
  activeId,
  onSelect,
  interactive = true,
  compactPins = false,
}: ListingsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activePoint = points.find((point) => point.id === activeId);

  return (
    <div
      ref={containerRef}
      className={className}
      /* La miniatura es puramente decorativa: el boton que la envuelve es quien recibe el foco. */
      aria-hidden={interactive ? undefined : true}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        dragging={interactive}
        scrollWheelZoom={interactive}
        doubleClickZoom={interactive}
        touchZoom={interactive}
        boxZoom={interactive}
        keyboard={interactive}
        zoomControl={interactive}
        attributionControl={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          keepBuffer={4}
          updateWhenIdle={false}
        />

        <MapResize containerRef={containerRef} />
        <FitToPoints points={points} emptyCenter={center} />
        <FlyToActive point={interactive ? activePoint : undefined} />

        {points.map((point) => (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            icon={buildPriceIcon(point.priceLabel, point.id === activeId, compactPins)}
            eventHandlers={{ click: () => onSelect?.(point.id) }}
          >
            {interactive ? (
              <Popup autoPan closeButton={false} className="ariz-map-popup">
                <ListingsMapCard point={point} />
              </Popup>
            ) : null}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
