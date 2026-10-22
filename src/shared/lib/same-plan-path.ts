import type { Point } from "./site-plan";

// A polygon is identical even if its first vertex or drawing direction differs.
export function samePlanPath(a: Point[], b: Point[]): boolean {
  const open = (path: Point[]) => path.length > 1 && path[0].lat === path[path.length - 1].lat && path[0].lng === path[path.length - 1].lng ? path.slice(0, -1) : path;
  a = open(a);
  b = open(b);
  if (a.length !== b.length || a.length < 3) return false;
  return b.some((_, start) => [1, -1].some(direction => a.every((point, i) => {
    const other = b[(start + direction * i + b.length) % b.length];
    return point.lat === other.lat && point.lng === other.lng;
  })));
}
