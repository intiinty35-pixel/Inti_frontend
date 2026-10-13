import { apiClient } from "@/shared/lib/api/client";

export interface MapsPoint {
  latitude: number;
  longitude: number;
}

const COORD_PATTERNS = [
  /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
  /@(-?\d+\.\d+),(-?\d+\.\d+)/,
  /[?&](?:q|ll|query|destination)=(-?\d+\.\d+)[, ](-?\d+\.\d+)/,
] as const;

function toPoint(latitude: number, longitude: number): MapsPoint | null {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return { latitude: Number(latitude.toFixed(7)), longitude: Number(longitude.toFixed(7)) };
}

/** Lee las coordenadas de un enlace largo de Google Maps, o de un par "lat, lng" pegado a mano. */
export function parseCoordinates(value: string): MapsPoint | null {
  let text = value.trim();
  try {
    text = decodeURIComponent(text);
  } catch {
    // Se usa el texto tal cual si no es una URL codificada valida.
  }

  const plain = /^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/.exec(text);
  if (plain) return toPoint(Number(plain[1]), Number(plain[2]));

  for (const pattern of COORD_PATTERNS) {
    const match = pattern.exec(text);
    if (match) return toPoint(Number(match[1]), Number(match[2]));
  }
  return null;
}

/**
 * Obtiene el punto de un enlace de Google Maps. Los enlaces largos se leen en el
 * navegador; los cortos (maps.app.goo.gl) los resuelve el backend.
 */
export async function resolveMapsLink(value: string): Promise<MapsPoint> {
  const direct = parseCoordinates(value);
  if (direct) return direct;

  const url = value.trim();
  if (!/^https:\/\//i.test(url)) {
    throw new Error("Pega un enlace de Google Maps (https://...) o las coordenadas como «-3.57, -80.45».");
  }
  return apiClient.post<MapsPoint>("/geo/resolve-maps-link", { url });
}

/** Enlace para abrir el punto en Google Maps. */
export function buildGoogleMapsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}
