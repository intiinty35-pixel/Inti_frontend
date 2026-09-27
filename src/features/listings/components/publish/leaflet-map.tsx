"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import L, { type LeafletMouseEvent } from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

export interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onChange: (location: { latitude: number; longitude: number }) => void;
}

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapSync({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom(), { animate: true });
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

export function LeafletMap({ latitude, longitude, onChange }: LocationPickerProps) {
  const center = useMemo<[number, number]>(() => [latitude, longitude], [latitude, longitude]);

  return (
    <div className="overflow-hidden rounded-card border border-edge">
      <MapContainer center={center} zoom={15} scrollWheelZoom className="h-80 w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapSync latitude={latitude} longitude={longitude} />
        <MapEvents onChange={onChange} />
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