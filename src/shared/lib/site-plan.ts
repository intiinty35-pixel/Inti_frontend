import type { FloorPoint, PlanBuilding } from "./apartment-plan";

export type Point = { lat: number; lng: number };
export type PlanCrop = { left: number; top: number; right: number; bottom: number };
export type PlanImage = {
  crop?: PlanCrop;
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
  mode?: "LOTS" | "APARTMENTS";
  buildings?: PlanBuilding[];
  image?: PlanImage;
  logoUrl: string;
  zones: PlanZone[];
  lots: PlanLot[];
};
export type PlanSession = {
  project: {
    id: string;
    name: string;
    category?: "LOTIZACION" | "DEPARTAMENTOS";
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
export const AVAILABLE_LOT_BORDER = "#008a3b";
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
export function measuredLotGroup(path: Point[], count: number, front: number, depth: number, alternateDirection = false, reverseOrder = false) {
  if (!Number.isFinite(front) || !Number.isFinite(depth) || front <= 0 || depth <= 0) throw new Error("Ingresa frente y fondo mayores que cero.");
  const ordered = alternateDirection && path.length === 4 ? [path[1], path[2], path[3], path[0]] : path;
  const round = (value: number) => Math.round(value * 100) / 100;
  const parts = splitQuad(ordered, count);
  if (reverseOrder) parts.reverse();
  return parts.map(path => ({
    path, frontM: front, areaM2: round(front * depth), perimeterM: round(2 * (front + depth)), dimensions: `${front} × ${depth} m`,
  }));
}

export function lotNumberRange(start: number, end: number): number[] {
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 1 || end < 1 || Math.abs(end - start) >= 100)
    throw new Error("Indica números enteros positivos, con un máximo de 100 lotes por grupo.");
  const step = end >= start ? 1 : -1;
  return Array.from({ length: Math.abs(end - start) + 1 }, (_, i) => start + i * step);
}

/** Repeats a straightened first lot, sharing each boundary and retaining its orientation. */
export function repeatedLotGroup(path: Point[], count: number, front: number, depth: number, direction: Point, reverseOrder = false) {
  if (!Number.isInteger(count) || count < 1 || count > 100)
    throw new Error("Elige entre 1 y 100 lotes.");
  // Reuse the quadrilateral and dimension checks before straightening opposite edges.
  measuredLotGroup(path, 2, front, depth);
  if (!Number.isFinite(direction.lat) || !Number.isFinite(direction.lng) || (!direction.lat && !direction.lng))
    throw new Error("Elige una dirección para repetir los lotes.");
  const center = {
    lat: path.reduce((sum, p) => sum + p.lat, 0) / 4,
    lng: path.reduce((sum, p) => sum + p.lng, 0) / 4,
  };
  const u = { lat: (path[1].lat - path[0].lat + path[2].lat - path[3].lat) / 2, lng: (path[1].lng - path[0].lng + path[2].lng - path[3].lng) / 2 };
  const v = { lat: (path[3].lat - path[0].lat + path[2].lat - path[1].lat) / 2, lng: (path[3].lng - path[0].lng + path[2].lng - path[1].lng) / 2 };
  const cosine = Math.cos(center.lat * Math.PI / 180);
  const score = (edge: Point) => (edge.lat * direction.lat + edge.lng * direction.lng * cosine ** 2) / Math.hypot(edge.lat, edge.lng * cosine);
  const edge = Math.abs(score(u)) >= Math.abs(score(v)) ? u : v;
  const sign = score(edge) >= 0 ? 1 : -1;
  const base = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => ({
    lat: center.lat + (a * u.lat + b * v.lat) / 2,
    lng: center.lng + (a * u.lng + b * v.lng) / 2,
  }));
  const lots = Array.from({ length: count }, (_, i) => ({
    path: base.map(p => ({ lat: p.lat + i * sign * edge.lat, lng: p.lng + i * sign * edge.lng })),
    frontM: front,
    areaM2: Math.round(front * depth * 100) / 100,
    perimeterM: Math.round(2 * (front + depth) * 100) / 100,
    dimensions: `${front} × ${depth} m`,
  }));
  return reverseOrder ? lots.reverse() : lots;
}

/** Fit the requested number of lots to a boundary, using the model's orientation and proportions. */
export function blockLotGroup(block: Point[], seed: Point[], count: number, front: number, depth: number, reverseOrder = false) {
  if (block.length < 3 || block.some(p => !Number.isFinite(p.lat) || !Number.isFinite(p.lng)))
    throw new Error("Dibuja primero el contorno del grupo de lotes.");
  const template = repeatedLotGroup(seed, 1, front, depth, { lat: 0, lng: 1 })[0];
  if (!Number.isInteger(count) || count < 1 || count > 100)
    throw new Error("Elige entre 1 y 100 lotes.");
  const [origin, b, , d] = template.path;
  const u = { lat: b.lat - origin.lat, lng: b.lng - origin.lng };
  const v = { lat: d.lat - origin.lat, lng: d.lng - origin.lng };
  const determinant = u.lng * v.lat - u.lat * v.lng;
  type XY = { x: number; y: number };
  const project = (p: Point): XY => ({
    x: ((p.lng - origin.lng) * v.lat - (p.lat - origin.lat) * v.lng) / determinant,
    y: (u.lng * (p.lat - origin.lat) - u.lat * (p.lng - origin.lng)) / determinant,
  });
  const unproject = (p: XY): Point => ({ lat: origin.lat + p.x * u.lat + p.y * v.lat, lng: origin.lng + p.x * u.lng + p.y * v.lng });
  const boundary = block.map(project);
  const epsilon = 1e-7;
  const cross = (a: XY, b: XY, c: XY) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  const inside = (p: XY, polygon: XY[], includeBoundary = true) => {
    let result = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const a = polygon[j], b = polygon[i];
      if (Math.abs(cross(a, b, p)) <= epsilon && p.x >= Math.min(a.x, b.x) - epsilon && p.x <= Math.max(a.x, b.x) + epsilon && p.y >= Math.min(a.y, b.y) - epsilon && p.y <= Math.max(a.y, b.y) + epsilon) return includeBoundary;
      if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) result = !result;
    }
    return result;
  };
  const sample = (polygon: XY[]) => [...polygon, ...polygon.map((p, i) => ({ x: (p.x + polygon[(i + 1) % polygon.length].x) / 2, y: (p.y + polygon[(i + 1) % polygon.length].y) / 2 })), { x: polygon.reduce((n, p) => n + p.x, 0) / polygon.length, y: polygon.reduce((n, p) => n + p.y, 0) / polygon.length }];
  const crosses = (a: XY[], b: XY[]) => a.some((p, i) => b.some((r, j) => {
    const q = a[(i + 1) % a.length], s = b[(j + 1) % b.length];
    const first = cross(p, q, r), second = cross(p, q, s), third = cross(r, s, p), fourth = cross(r, s, q);
    return ((first > epsilon && second < -epsilon) || (first < -epsilon && second > epsilon))
      && ((third > epsilon && fourth < -epsilon) || (third < -epsilon && fourth > epsilon));
  }));
  if (crosses(boundary, boundary))
    throw new Error("El contorno del grupo no debe cruzarse. Vuelve a dibujarlo en orden.");
  const contains = (cell: XY[]) => {
    if (!sample(cell).every(p => inside(p, boundary)) || crosses(cell, boundary)) return false;
    // Split each cell edge at every boundary vertex projection. This also handles concave notches touching grid lines.
    return cell.every((a, i) => {
      const b = cell[(i + 1) % cell.length];
      const dx = b.x - a.x, dy = b.y - a.y;
      const fractions = [0, 1, ...boundary.map(p => ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)).filter(t => t > 0 && t < 1)].sort((x, y) => x - y);
      return fractions.slice(1).every((t, j) => {
        const middle = (t + fractions[j]) / 2;
        return inside({ x: a.x + middle * dx, y: a.y + middle * dy }, boundary);
      });
    });
  };
  const minX = Math.min(...boundary.map(p => p.x));
  const maxX = Math.max(...boundary.map(p => p.x));
  const minY = Math.min(...boundary.map(p => p.y));
  const maxY = Math.max(...boundary.map(p => p.y));
  const area = (polygon: XY[]) => Math.abs(polygon.reduce((sum, p, i) => {
    const q = polygon[(i + 1) % polygon.length];
    return sum + p.x * q.y - q.x * p.y;
  }, 0)) / 2;
  if (area(boundary) < 1e-10) throw new Error("El contorno del grupo debe tener área.");
  const clip = (polygon: XY[], axis: "x" | "y", value: number, less: boolean) => {
    const result: XY[] = [];
    polygon.forEach((b, i) => {
      const a = polygon[(i + polygon.length - 1) % polygon.length];
      const aInside = less ? a[axis] <= value : a[axis] >= value;
      const bInside = less ? b[axis] <= value : b[axis] >= value;
      if (aInside !== bInside) {
        const t = (value - a[axis]) / (b[axis] - a[axis]);
        result.push({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) });
      }
      if (bInside) result.push(b);
    });
    return result.filter((p, i) => Math.hypot(p.x - result[(i + result.length - 1) % result.length].x, p.y - result[(i + result.length - 1) % result.length].y) > 1e-10);
  };
  const takeArea = (polygon: XY[], axis: "x" | "y", fraction: number): [XY[], XY[]] => {
    if (fraction >= 1) return [polygon, []];
    let low = Math.min(...polygon.map(p => p[axis])), high = Math.max(...polygon.map(p => p[axis]));
    const target = area(polygon) * fraction;
    for (let attempt = 0; attempt < 45; attempt++) {
      const middle = (low + high) / 2;
      if (area(clip(polygon, axis, middle, true)) < target) low = middle;
      else high = middle;
    }
    const cut = (low + high) / 2;
    return [clip(polygon, axis, cut, true), clip(polygon, axis, cut, false)];
  };
  const turns = boundary.map((p, i) => cross(p, boundary[(i + 1) % boundary.length], boundary[(i + 2) % boundary.length]));
  const convex = turns.every(t => t >= -epsilon) || turns.every(t => t <= epsilon);
  const partitionConvex = () => {
    let bestRows = 1, bestScore = Infinity;
    for (let rows = 1; rows <= count; rows++) {
      const sizes = Array.from({ length: rows }, (_, i) => Math.floor(count / rows) + (i < count % rows ? 1 : 0));
      const score = sizes.reduce((sum, size) => sum + size / count * Math.log((maxX - minX) * count / ((maxY - minY) * size ** 2)) ** 2, 0);
      if (score < bestScore) { bestScore = score; bestRows = rows; }
    }
    let remaining = boundary, remainingCount = count;
    const result: Point[][] = [];
    for (let row = 0; row < bestRows; row++) {
      const size = Math.floor(count / bestRows) + (row < count % bestRows ? 1 : 0);
      const [band, rest] = takeArea(remaining, "y", size / remainingCount);
      remaining = rest;
      remainingCount -= size;
      let pending = band;
      for (let column = 0; column < size; column++) {
        const [cell, tail] = takeArea(pending, "x", 1 / (size - column));
        pending = tail;
        const start = cell.reduce((best, p, i) => Math.hypot(p.x, p.y) < Math.hypot(cell[best].x, cell[best].y) ? i : best, 0);
        result.push([...cell.slice(start), ...cell.slice(0, start)].map(unproject));
      }
    }
    return result;
  };
  const fit = (scale: number) => {
    const paths: Point[][] = [];
    const columns = Math.floor((maxX - minX) / scale + epsilon);
    const rows = Math.floor((maxY - minY) / scale + epsilon);
    let checked = 0;
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const x = minX + column * scale, y = minY + row * scale;
        const cell = [{ x, y }, { x: x + scale, y }, { x: x + scale, y: y + scale }, { x, y: y + scale }];
        if (contains(cell)) paths.push(cell.map(unproject));
        if (paths.length === count || ++checked >= 25000) return paths;
      }
    }
    return paths;
  };
  let upper = Math.max(maxX - minX, maxY - minY);
  let lower = upper;
  let paths: Point[][] = convex ? partitionConvex() : [];
  // Find a scale that fits every requested lot, then enlarge without changing the count.
  for (let attempt = 0; !convex && attempt < 50; attempt++) {
    paths = fit(lower);
    if (paths.length === count) break;
    upper = lower;
    lower /= 2;
  }
  if (paths.length !== count)
    throw new Error("No se pudo preparar la distribución. Revisa que el contorno tenga área y no se cruce.");
  for (let attempt = 0; !convex && attempt < 28; attempt++) {
    const middle = (lower + upper) / 2;
    const candidate = fit(middle);
    if (candidate.length === count) { lower = middle; paths = candidate; }
    else upper = middle;
  }
  const distance = (a: Point, b: Point) => Math.hypot((b.lat - a.lat) * 111320, (b.lng - a.lng) * 111320 * Math.cos(a.lat * Math.PI / 180));
  const round = (value: number) => Math.round(value * 100) / 100;
  const lots = paths.map(path => {
    const xy = path.map(project);
    const frontM = round(distance(origin, b) * (Math.max(...xy.map(p => p.x)) - Math.min(...xy.map(p => p.x))));
    const depthM = round(distance(origin, d) * (Math.max(...xy.map(p => p.y)) - Math.min(...xy.map(p => p.y))));
    return { path, ...polygonMetrics(path), frontM, dimensions: `${frontM} × ${depthM} m` };
  });
  return reverseOrder ? lots.reverse() : lots;
}

export function distributeFloorGroup(path: FloorPoint[], count: number, layout: "AUTO" | "COLUMNS" | "ROWS" = "AUTO", aspect = 1): FloorPoint[][] {
  if (!Number.isInteger(count) || count < 1 || count > 100) throw new Error("Elige entre 1 y 100 departamentos para el grupo.");
  if (path.length < 3 || path.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y) || p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1) || !Number.isFinite(aspect) || aspect <= 0)
    throw new Error("Dibuja el contorno del grupo dentro del plano del piso.");
  const cosine = Math.cos(-12 * Math.PI / 180), scale = .001;
  const project = (p: FloorPoint): Point => ({ lat: -12 + p.y * aspect * scale, lng: -77 + p.x * scale / cosine });
  const minX = Math.min(...path.map(p => p.x)), maxX = Math.max(...path.map(p => p.x));
  const minY = Math.min(...path.map(p => p.y)), maxY = Math.max(...path.map(p => p.y));
  const w = maxX - minX, h = maxY - minY;
  const dx = layout === "COLUMNS" ? w / count : layout === "ROWS" ? w : .1;
  const dy = layout === "COLUMNS" ? h : layout === "ROWS" ? h / count : .1 / aspect;
  const seed = [{ x: minX, y: minY }, { x: minX + dx, y: minY }, { x: minX + dx, y: minY + dy }, { x: minX, y: minY + dy }].map(project);
  return blockLotGroup(path.map(project), seed, count, 1, 1).map(lot => lot.path.map(p => ({
    x: Math.max(0, Math.min(1, (p.lng + 77) * cosine / scale)),
    y: Math.max(0, Math.min(1, (p.lat + 12) / (scale * aspect))),
  })));
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
  if (path.some(p => !Number.isFinite(p.lat) || !Number.isFinite(p.lng)))
    throw new Error("Revisa las coordenadas del grupo.");
  const turns = path.map((a, i) => {
    const b = path[(i + 1) % 4], c = path[(i + 2) % 4];
    return (b.lng - a.lng) * (c.lat - b.lat) - (b.lat - a.lat) * (c.lng - b.lng);
  });
  if (!turns.every(t => t > 0) && !turns.every(t => t < 0))
    throw new Error("Dibuja cuatro esquinas en orden, sin cruces ni entrantes.");
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
