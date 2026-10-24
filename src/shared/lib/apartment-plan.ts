import type { PlanCrop, Point, SitePlan } from "./site-plan";

export type FloorPoint = { x: number; y: number };
export type ApartmentStatus = "AVAILABLE" | "RESERVED" | "SOLD" | "RENTED" | "BLOCKED";
export type PlanApartment = {
  id: string;
  code: string;
  areaM2: number;
  price: number;
  operation: "SALE" | "RENT";
  status: ApartmentStatus;
  maintenanceFee: number;
  bedrooms: number;
  bathrooms: number;
  notes: string;
  path: FloorPoint[];
};
export type PlanFloor = {
  id: string;
  number: number;
  name: string;
  image?: { url: string; width: number; height: number; crop?: PlanCrop };
  imageSource?: "BASE" | "CUSTOM";
  apartments: PlanApartment[];
};
export type PlanBuilding = { id: string; name: string; path: Point[]; floors: PlanFloor[] };

export const APARTMENT_STATUS_LABELS: Record<ApartmentStatus, string> = {
  AVAILABLE: "Disponible", RESERVED: "Reservado", SOLD: "Vendido", RENTED: "Alquilado", BLOCKED: "Bloqueado",
};
export const APARTMENT_STATUS_COLORS: Record<ApartmentStatus, string> = {
  AVAILABLE: "#059669", RESERVED: "#d97706", SOLD: "#dc2626", RENTED: "#7c3aed", BLOCKED: "#64748b",
};
export const apartmentCode = (floor: number, index: number) => `${floor < 0 ? `S${Math.abs(floor)}-` : floor}${String(index + 1).padStart(2, "0")}`;

export function resolveFloorImage(plan: SitePlan, floor: PlanFloor): PlanFloor["image"] {
  if (floor.image) return floor.image;
  if (!plan.image) return undefined;
  return { url: plan.image.url, width: 1000, height: 1000 * plan.image.heightM / plan.image.widthM, ...(plan.image.crop ? { crop: { ...plan.image.crop } } : {}) };
}

export function apartmentGroupCodes(first: string, count: number): string[] {
  const match = first.trim().match(/^(.*?)(\d+)$/);
  if (!match || !Number.isInteger(count) || count < 1 || count > 100) throw new Error("Indica el código inicial y una cantidad entre 1 y 100 departamentos.");
  const start = Number(match[2]);
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(start + count - 1)) throw new Error("Revisa la numeración inicial del grupo.");
  const codes = Array.from({ length: count }, (_, index) => `${match[1]}${String(start + index).padStart(match[2].length, "0")}`);
  if (codes.some(code => code.length > 80)) throw new Error("Los códigos de los departamentos deben tener como máximo 80 caracteres.");
  return codes;
}

export function duplicateFloor(source: PlanFloor, number: number): PlanFloor {
  return {
    ...source, id: crypto.randomUUID(), number, name: `Piso ${number}`,
    ...(source.image ? { image: { ...source.image, ...(source.image.crop ? { crop: { ...source.image.crop } } : {}) } } : {}),
    apartments: source.apartments.map((apartment, index) => ({
      ...apartment, id: crypto.randomUUID(), code: apartmentCode(number, index), status: "AVAILABLE",
      path: apartment.path.map(point => ({ ...point })),
    })),
  };
}

export function buildingMapPlan(plan: SitePlan): SitePlan {
  return {
    ...plan, lots: [],
    zones: [...plan.zones, ...(plan.buildings ?? []).map(building => ({
      id: building.id, name: building.name, path: building.path, kind: "BLOCK" as const,
    }))],
  };
}

export function floorPolygonValid(path: FloorPoint[]): boolean {
  if (path.length < 3 || path.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y) || p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1)) return false;
  const cross = (a: FloorPoint, b: FloorPoint, c: FloorPoint) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  let area = 0;
  for (let i = 0; i < path.length; i++) {
    const a = path[i], b = path[(i + 1) % path.length];
    if (Math.hypot(b.x - a.x, b.y - a.y) < 1e-6) return false;
    area += a.x * b.y - b.x * a.y;
    for (let j = i + 2; j < path.length; j++) {
      if (i === 0 && j === path.length - 1) continue;
      const c = path[j], d = path[(j + 1) % path.length];
      if (cross(a, b, c) * cross(a, b, d) <= 0 && cross(c, d, a) * cross(c, d, b) <= 0
        && Math.max(Math.min(a.x, b.x), Math.min(c.x, d.x)) <= Math.min(Math.max(a.x, b.x), Math.max(c.x, d.x))
        && Math.max(Math.min(a.y, b.y), Math.min(c.y, d.y)) <= Math.min(Math.max(a.y, b.y), Math.max(c.y, d.y))) return false;
    }
  }
  return Math.abs(area) > 1e-8;
}
