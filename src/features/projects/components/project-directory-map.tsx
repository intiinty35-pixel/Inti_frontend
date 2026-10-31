"use client";

import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';

export type DirectoryPoint = { id: string; lat: number; lng: number };
const icon = new L.Icon({ iconUrl: '/web_v/ubicacion.png', iconSize: [27, 33], iconAnchor: [13, 33] });

function FitPoints({ points }: { points: DirectoryPoint[] }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    if (points.length) map.fitBounds(L.latLngBounds(points.map(point => [point.lat, point.lng])), { padding: [30, 30], maxZoom: 12, animate: false });
  }, [map, points]);
  return null;
}

export function ProjectDirectoryMap({ points }: { points: DirectoryPoint[] }) {
  return <MapContainer center={[-17.783333, -63.182126]} zoom={5} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} touchZoom={false} boxZoom={false} keyboard={false} zoomControl={false} style={{ height: '100%', width: '100%' }}>
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
    <FitPoints points={points} />
    {points.map(point => <Marker key={point.id} position={[point.lat, point.lng]} icon={icon} interactive={false} />)}
  </MapContainer>;
}
