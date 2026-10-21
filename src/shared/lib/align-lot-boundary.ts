import type { Point } from './site-plan';
type XY = { x: number; y: number };
const cross = (a: XY, b: XY, c: XY) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
function inside(p: XY, polygon: XY[], boundary = true) {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[j], b = polygon[i];
    if (Math.abs(cross(a, b, p)) < 1e-6 && p.x >= Math.min(a.x, b.x) - 1e-7 && p.x <= Math.max(a.x, b.x) + 1e-7 && p.y >= Math.min(a.y, b.y) - 1e-7 && p.y <= Math.max(a.y, b.y) + 1e-7) return boundary;
    if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) result = !result;
  }
  return result;
}
function crosses(a: XY[], b: XY[]) {
  return a.some((p, i) => b.some((r, j) => {
    const q = a[(i + 1) % a.length], s = b[(j + 1) % b.length];
    return cross(p, q, r) * cross(p, q, s) < -1e-9 && cross(r, s, p) * cross(r, s, q) < -1e-9;
  }));
}
export function alignLotToBoundary(path: Point[], block: Point[], neighbors: Point[][] = []): Point[] | undefined {
  if (path.length < 3 || block.length < 3) return;
  const origin = block[0], longitudeScale = 111320 * Math.cos(origin.lat * Math.PI / 180);
  const project = (p: Point): XY => ({ x: (p.lng - origin.lng) * longitudeScale, y: (p.lat - origin.lat) * 111320 });
  const lot = path.map(project), boundary = block.map(project), obstacles = neighbors.filter(p => p.length >= 3).map(p => p.map(project));
  let best: XY[] | undefined, bestDistance = Infinity;
  boundary.forEach((a, i) => {
    const b = boundary[(i + 1) % boundary.length], length = Math.hypot(b.x - a.x, b.y - a.y);
    if (length < 1e-6) return;
    const ux = (b.x - a.x) / length, uy = (b.y - a.y) / length;
    lot.forEach((p, j) => {
      const q = lot[(j + 1) % lot.length], edge = Math.hypot(q.x - p.x, q.y - p.y);
      if (edge > length + 1e-6 || edge < 1e-6) return;
      let angle = Math.atan2(uy, ux) - Math.atan2(q.y - p.y, q.x - p.x);
      angle = Math.atan2(Math.sin(angle), Math.cos(angle));
      if (angle > Math.PI / 2) angle -= Math.PI;
      if (angle < -Math.PI / 2) angle += Math.PI;
      if (Math.abs(angle) > Math.PI / 18) return;
      const mid = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
      const t = Math.max(edge / 2, Math.min(length - edge / 2, (mid.x - a.x) * ux + (mid.y - a.y) * uy));
      const target = { x: a.x + ux * t, y: a.y + uy * t };
      const reach = Math.max(...lot.map(v => Math.hypot(v.x - mid.x, v.y - mid.y)));
      if (Math.hypot(target.x - mid.x, target.y - mid.y) > reach) return;
      const moved = lot.map(v => ({ x: target.x + (v.x - mid.x) * Math.cos(angle) - (v.y - mid.y) * Math.sin(angle), y: target.y + (v.x - mid.x) * Math.sin(angle) + (v.y - mid.y) * Math.cos(angle) }));
      if (moved.some(v => !inside(v, boundary)) || crosses(moved, boundary)) return;
      const samples = (polygon: XY[]) => [...polygon, ...polygon.map((v, k) => ({ x: (v.x + polygon[(k + 1) % polygon.length].x) / 2, y: (v.y + polygon[(k + 1) % polygon.length].y) / 2 })), { x: polygon.reduce((n, v) => n + v.x, 0) / polygon.length, y: polygon.reduce((n, v) => n + v.y, 0) / polygon.length }];
      if (obstacles.some(other => crosses(moved, other) || samples(moved).some(v => inside(v, other, false)) || samples(other).some(v => inside(v, moved, false)))) return;
      const distance = moved.reduce((sum, v, k) => sum + Math.hypot(v.x - lot[k].x, v.y - lot[k].y), 0);
      if (distance < bestDistance) { bestDistance = distance; best = moved; }
    });
  });
  return best?.map(p => ({ lat: origin.lat + p.y / 111320, lng: origin.lng + p.x / longitudeScale }));
}
