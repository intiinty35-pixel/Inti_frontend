export type Point = { lat: number; lng: number };
export type PlanImage = {
  url: string;
  center: Point;
  widthM: number;
  heightM: number;
  rotation: number;
  opacity: number;
  sourcePdfUrl?: string;
  sourcePdfPage?: number;
  sourcePdfName?: string;
};
export type PlanZone = {
  id: string;
  kind: "BLOCK" | "STREET" | "PARK" | "CONTOUR";
  name: string;
  path: Point[];
};
export type PlanLot = {
  fromExcel?: boolean;
  id: string;
  code: string;
  block: string;
  street: string;
  address: string;
  type: string;
  dimensions: string;
  areaM2: number;
  perimeterM: number;
  frontM: number;
  price: number;
  priceM2: number;
  status: "AVAILABLE" | "RESERVED" | "SOLD" | "BLOCKED";
  cashAllowed: boolean;
  financingAllowed: boolean;
  financedPrice: number;
  downPayment: number;
  installments: number;
  monthlyPayment: number;
  interestRateMonthly?: number;
  notes: string;
  path: Point[];
};
export type SitePlan = {
  image?: PlanImage;
  logoUrl: string;
  zones: PlanZone[];
  lots: PlanLot[];
};
export type PlanSession = {
  project: {
    id: string;
    name: string;
    currency: "PEN" | "USD";
    status: string;
    location: {
      street?: string;
      streetNumber?: string;
      district?: string;
      province?: string;
      department?: string;
      latitude: number | string | null;
      longitude: number | string | null;
    } | null;
  };
  plan: SitePlan;
  revision: number;
  publishedAt?: string | null;
};
export const LOT_COLORS = {
  AVAILABLE: "#10b981",
  RESERVED: "#f59e0b",
  SOLD: "#ef4444",
  BLOCKED: "#64748b",
};
export const LOT_LABELS = {
  AVAILABLE: "Disponible",
  RESERVED: "Reservado",
  SOLD: "Vendido",
  BLOCKED: "Bloqueado",
};
export const LOT_PLAN_LABELS = {
  AVAILABLE: "Disponible",
  RESERVED: "Separado",
  SOLD: "Vendido",
  BLOCKED: "Bloqueado",
};
export function newLot(path: Point[] = []): PlanLot {
  const metrics = polygonMetrics(path);
  return {
    id: crypto.randomUUID(),
    code: "",
    block: "",
    street: "",
    address: "",
    type: "",
    dimensions: "",
    areaM2: metrics.areaM2 || 120,
    perimeterM: metrics.perimeterM,
    frontM: 0,
    price: 0,
    priceM2: 0,
    status: "AVAILABLE",
    cashAllowed: true,
    financingAllowed: false,
    financedPrice: 0,
    downPayment: 0,
    installments: 14,
    monthlyPayment: 0,
    notes: "",
    path,
  };
}
// Local metric projection is suitable for lot-scale polygons; cadastral values remain editable.
export function polygonMetrics(path: Point[]) {
  if (path.length < 3) return { areaM2: 0, perimeterM: 0 };
  const origin = path[0];
  const xy = path.map((p) => ({
    x: (p.lng - origin.lng) * 111320 * Math.cos((origin.lat * Math.PI) / 180),
    y: (p.lat - origin.lat) * 111320,
  }));
  let area = 0,
    perimeter = 0;
  xy.forEach((p, i) => {
    const q = xy[(i + 1) % xy.length];
    area += p.x * q.y - q.x * p.y;
    perimeter += Math.hypot(q.x - p.x, q.y - p.y);
  });
  return {
    areaM2: Math.round((Math.abs(area) / 2) * 100) / 100,
    perimeterM: Math.round(perimeter * 100) / 100,
  };
}
export function measuredLotGroup(path: Point[], count: number, front: number, depth: number, alternateDirection = false) {
  if (!Number.isFinite(front) || !Number.isFinite(depth) || front <= 0 || depth <= 0) throw new Error("Ingresa frente y fondo mayores que cero.");
  const ordered = alternateDirection && path.length === 4 ? [path[1], path[2], path[3], path[0]] : path;
  const round = (value: number) => Math.round(value * 100) / 100;
  return splitQuad(ordered, count).map(path => ({
    path, frontM: front, areaM2: round(front * depth), perimeterM: round(2 * (front + depth)), dimensions: `${front} × ${depth} m`,
  }));
}
export function splitQuad(path: Point[], count: number): Point[][] {
  if (path.length !== 4 || !Number.isInteger(count) || count < 2 || count > 100)
    throw new Error(
      "Dibuja cuatro vértices en orden y elige entre 2 y 100 lotes.",
    );
  const mix = (a: Point, b: Point, t: number): Point => ({
    lat: a.lat + (b.lat - a.lat) * t,
    lng: a.lng + (b.lng - a.lng) * t,
  });
  const origin = path[0];
  const area = (points: Point[]) => {
    const xy = points.map((p) => ({
      x: (p.lng - origin.lng) * Math.cos((origin.lat * Math.PI) / 180),
      y: p.lat - origin.lat,
    }));
    return (
      Math.abs(
        xy.reduce((sum, p, i) => {
          const q = xy[(i + 1) % xy.length];
          return sum + p.x * q.y - q.x * p.y;
        }, 0),
      ) / 2
    );
  };
  const total = area(path);
  if (total < 1e-14)
    throw new Error("El grupo debe tener área. Revisa sus cuatro vértices.");
  const cuts = Array.from({ length: count + 1 }, (_, i) => {
    if (i === 0) return 0;
    if (i === count) return 1;
    let low = 0,
      high = 1;
    for (let n = 0; n < 45; n++) {
      const t = (low + high) / 2;
      const partial = area([
        path[0],
        mix(path[0], path[1], t),
        mix(path[3], path[2], t),
        path[3],
      ]);
      if (partial < (total * i) / count) low = t;
      else high = t;
    }
    return (low + high) / 2;
  });
  return Array.from({ length: count }, (_, i) => [
    mix(path[0], path[1], cuts[i]),
    mix(path[0], path[1], cuts[i + 1]),
    mix(path[3], path[2], cuts[i + 1]),
    mix(path[3], path[2], cuts[i]),
  ]);
}
