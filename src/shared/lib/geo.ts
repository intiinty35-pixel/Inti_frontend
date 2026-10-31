const NOMINATIM_SEARCH = "https://nominatim.openstreetmap.org/search";
const COUNTRY = "Bolivia";
const COUNTRY_CODE = "bo";

export interface MapPlace {
  latitude: number;
  longitude: number;
  label: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

/** Une las partes de una direccion en el orden que espera el geocodificador. */
export function buildAddressQuery(parts: readonly (string | undefined)[]): string {
  return parts
    .map((part) => part?.trim() ?? "")
    .filter(Boolean)
    .join(", ");
}

function toPlace(result: NominatimResult): MapPlace {
  return {
    latitude: Number(Number(result.lat).toFixed(7)),
    longitude: Number(Number(result.lon).toFixed(7)),
    label: result.display_name,
  };
}

/**
 * Resuelve una direccion a coordenadas contra el buscador de OpenStreetMap.
 * Devuelve `null` cuando no hay coincidencias; lanza si la consulta falla.
 */
export async function searchMapPlace(
  parts: readonly (string | undefined)[],
  options: { signal?: AbortSignal } = {},
): Promise<MapPlace | null> {
  if (!buildAddressQuery(parts)) {
    return null;
  }

  const search = new URLSearchParams({
    format: "json",
    limit: "1",
    countrycodes: COUNTRY_CODE,
    q: buildAddressQuery([...parts, COUNTRY]),
  });

  const response = await fetch(`${NOMINATIM_SEARCH}?${search.toString()}`, {
    headers: { "Accept-Language": "es" },
    signal: options.signal,
  });

  if (!response.ok) {
    throw new Error(`El buscador de direcciones respondió ${response.status}`);
  }

  const results = (await response.json()) as NominatimResult[];
  const match = results[0];

  return match ? toPlace(match) : null;
}
