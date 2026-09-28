import type { Listing, PropertyDetail } from "@/features/listings/types/listing";

/**
 * Puntaje de similitud de una propiedad frente a la publicacion que se esta viendo.
 * Cada factor entrega un valor normalizado 0..1 y luego se pondera.
 */
export interface SimilarityBreakdown {
  price: number;
  zone: number;
  features: number;
}

export interface ScoredListing {
  listing: Listing;
  score: number;
  breakdown: SimilarityBreakdown;
}

/** Pesos del algoritmo. Suman 100 para que el puntaje final se lea como porcentaje. */
const WEIGHTS = {
  price: 0.4,
  zone: 0.3,
  features: 0.3,
} as const;

/** Ventana de precio: fuera de +-60% del original la propiedad deja de ser comparable. */
const PRICE_WINDOW = 0.6;
/** Ventana de area: +-30% de tolerancia en m2 construidos/totales. */
const AREA_WINDOW = 0.3;

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function normalizeText(value?: string | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Precio: mide que tan cerca esta el monto respecto del original.
 * Solo compara entre la misma moneda y el mismo periodo (venta vs alquiler),
 * porque comparar S/ contra US$ o un precio mensual contra uno total no aporta.
 * Mismo monto => 1, borde de la ventana => 0.
 */
function scorePrice(source: Listing, candidate: Listing) {
  if (source.price.currency !== candidate.price.currency) return 0;
  if (source.price.period !== candidate.price.period) return 0;

  const base = source.price.amount;
  const other = candidate.price.amount;
  if (base <= 0 || other <= 0) return 0;

  const tolerance = base * PRICE_WINDOW;
  return clamp01(1 - Math.abs(base - other) / tolerance);
}

/**
 * Zona: premia la coincidencia geografica mas fina posible.
 * Distrito 1, provincia 0.6, departamento 0.3, distinto departamento 0.
 */
function scoreZone(source: Listing, candidate: Listing) {
  const districtMatch =
    normalizeText(source.location.district) !== "" &&
    normalizeText(source.location.district) === normalizeText(candidate.location.district);
  const provinceMatch =
    normalizeText(source.location.province) !== "" &&
    normalizeText(source.location.province) === normalizeText(candidate.location.province);
  const departmentMatch =
    normalizeText(source.location.department) !== "" &&
    normalizeText(source.location.department) === normalizeText(candidate.location.department);

  if (districtMatch && provinceMatch) return 1;
  if (provinceMatch) return 0.6;
  if (departmentMatch) return 0.3;
  return 0;
}

function scoreCount(source: number, candidate: number, tolerance = 1) {
  if (source <= 0 || candidate <= 0) return 0;
  return clamp01(1 - Math.abs(source - candidate) / (source * tolerance));
}

/**
 * Caracteristicas: tipo de inmueble, operacion, dormitorios, banos, area y
 * servicios compartidos. Es el factor que hace que dos propiedades del mismo
 * rango de precio y zona realmente se parezcan.
 */
function scoreFeatures(source: PropertyDetail, candidate: Listing) {
  const parts: number[] = [];

  parts.push(source.type === candidate.type ? 1 : 0);
  parts.push(source.operation === candidate.operation ? 1 : 0);
  parts.push(scoreCount(source.rooms, candidate.rooms));
  parts.push(scoreCount(source.bathrooms, candidate.bathrooms));

  const areaPairs: number[] = [];
  if (source.areaM2 > 0 && candidate.areaM2 > 0) {
    areaPairs.push(clamp01(1 - Math.abs(source.areaM2 - candidate.areaM2) / (source.areaM2 * AREA_WINDOW)));
  }
  parts.push(areaPairs.length > 0 ? areaPairs[0] : 0);

  // Servicios en comun (piscina, ascensor, terraza...). Sin datos en el listado
  // se omite el factor en lugar de castigar la similitud con un cero.
  const sourceAmenities = new Set((source.amenities ?? []).map((amenity) => amenity.code));
  if (sourceAmenities.size > 0 && candidate.amenityCodes && candidate.amenityCodes.length > 0) {
    const shared = candidate.amenityCodes.filter((code) => sourceAmenities.has(code)).length;
    parts.push(clamp01(shared / sourceAmenities.size));
  }

  const valid = parts.filter((part) => Number.isFinite(part));
  if (valid.length === 0) return 0;
  return valid.reduce((total, part) => total + part, 0) / valid.length;
}

export function scoreSimilarity(source: PropertyDetail, candidate: Listing): ScoredListing {
  const breakdown: SimilarityBreakdown = {
    price: scorePrice(source, candidate),
    zone: scoreZone(source, candidate),
    features: scoreFeatures(source, candidate),
  };

  const score =
    breakdown.price * WEIGHTS.price +
    breakdown.zone * WEIGHTS.zone +
    breakdown.features * WEIGHTS.features;

  return { listing: candidate, score, breakdown };
}

/**
 * Ordena candidatos por similitud y descarta los que no alcanzan el puntaje minimo.
 * El desempate es por publicacion mas reciente para que el bloque se sienta fresco.
 */
export function rankSimilarListings(
  source: PropertyDetail,
  candidates: Listing[],
  options: { limit?: number; minScore?: number } = {},
): ScoredListing[] {
  const { limit = 5, minScore = 0.45 } = options;
  const seen = new Set<string>([source.id]);

  return candidates
    .filter((candidate) => {
      if (seen.has(candidate.id)) return false;
      seen.add(candidate.id);
      return true;
    })
    .map((candidate) => scoreSimilarity(source, candidate))
    .filter((scored) => scored.score >= minScore)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.listing.publishedAt).getTime() - new Date(a.listing.publishedAt).getTime();
    })
    .slice(0, limit);
}
