import type { Point } from './site-plan';

type Pixel = { x: number; y: number };
export function snapPlanPoint(point: Point, paths: Point[][], project: (point: Point) => Pixel, tolerance = 10): { point: Point; snapped: boolean } {
  const pixel = project(point);
  let distance = tolerance;
  let vertex: Point | undefined;
  for (const path of paths) for (const candidate of path) {
    const p = project(candidate);
    const next = Math.hypot(p.x - pixel.x, p.y - pixel.y);
    if (next <= distance) { distance = next; vertex = candidate; }
  }
  if (vertex) return { point: vertex, snapped: true };
  let edge: Point | undefined;
  for (const path of paths) {
    if (path.length < 3) continue;
    path.forEach((a, i) => {
      const b = path[(i + 1) % path.length], start = project(a), end = project(b);
      const dx = end.x - start.x, dy = end.y - start.y;
      const lengthSquared = dx * dx + dy * dy;
      if (!lengthSquared) return;
      const t = Math.max(0, Math.min(1, ((pixel.x - start.x) * dx + (pixel.y - start.y) * dy) / lengthSquared));
      const next = Math.hypot(start.x + t * dx - pixel.x, start.y + t * dy - pixel.y);
      if (next <= distance) {
        distance = next;
        edge = { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
      }
    });
  }
  return { point: edge ?? point, snapped: !!edge };
}
