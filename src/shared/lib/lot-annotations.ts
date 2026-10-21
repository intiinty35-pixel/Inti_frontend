import type { PlanLot } from './site-plan';
import { polygonLabel } from './polygon-label';
import { rectangularSides } from './lot-measurements';

type XY = { x: number; y: number };
export type LotAnnotation = XY & { text: string; angle: number; size: number; color: string };
export function lotAnnotations(lot: PlanLot, points: XY[]): LotAnnotation[] {
  if (points.length < 3) return [];
  const center = polygonLabel(points);
  const longest = points.reduce((best, a, i) => {
    const b = points[(i + 1) % points.length];
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    return length > best.length ? { length, angle: Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI } : best;
  }, { length: 0, angle: 0 });
  const orientation = longest.angle > 90 ? longest.angle - 180 : longest.angle < -90 ? longest.angle + 180 : longest.angle;
  const areaText = `${lot.areaM2} m²`;
  const textLength = Math.max(lot.code.length, areaText.length);
  const size = Math.min(26, center.radius / 2.2, center.radius * 2 / (textLength * 0.58));
  if (size < 5) return [];
  const result: LotAnnotation[] = [
    { ...center, x: center.x + Math.sin(orientation * Math.PI / 180) * size * 1.15, y: center.y - Math.cos(orientation * Math.PI / 180) * size * 1.15, text: lot.code, angle: orientation, size, color: '#172d48' },
    { ...center, text: areaText, angle: orientation, size: size * 0.95, color: '#0f172a' },
  ];
  if (lot.status === 'SOLD' || lot.status === 'RESERVED') result.push({ ...center, y: center.y + size * 1.8, text: lot.status === 'SOLD' ? 'Vendido' : 'Separado', angle: 0, size: size * 0.75, color: '#9f1239' });
  const sides = rectangularSides(lot.dimensions);
  const lengths = points.map((a, i) => Math.hypot(points[(i + 1) % points.length].x - a.x, points[(i + 1) % points.length].y - a.y));
  const evenLonger = points.length === 4 && lengths[0] + lengths[2] >= lengths[1] + lengths[3];
  points.forEach((a, i) => {
    if (lengths[i] < 10) return;
    const b = points[(i + 1) % points.length];
    let angle = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    if (angle > 90) angle -= 180;
    if (angle < -90) angle += 180;
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const normal = { x: -(b.y - a.y) / lengths[i], y: (b.x - a.x) / lengths[i] };
    const direction = normal.x * (center.x - mid.x) + normal.y * (center.y - mid.y) >= 0 ? 1 : -1;
    const first = lot.path[i], second = lot.path[(i + 1) % lot.path.length];
    const measured = Math.hypot((second.lat - first.lat) * 111320, (second.lng - first.lng) * 111320 * Math.cos(first.lat * Math.PI / 180));
    const official = sides && points.length === 4 ? ((i % 2 === 0) === evenLonger ? Math.max(sides.front, sides.depth) : Math.min(sides.front, sides.depth)) : undefined;
    const text = `${official === undefined ? '≈' : ''}${(official ?? measured).toFixed(2)} m`;
    const edgeSize = Math.max(4, Math.min(16, center.radius / 3, (lengths[i] - 8) / (text.length * 0.62)));
    result.push({ x: mid.x + normal.x * direction * (edgeSize + 2), y: mid.y + normal.y * direction * (edgeSize + 2), text, angle, size: edgeSize, color: '#0f766e' });
  });
  return result;
}
