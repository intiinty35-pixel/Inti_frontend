type XY = { x: number; y: number };

export const STREET_COLOR = "#475569";
export const STREET_MARKING = "#fef3c7";
export const STREET_VERGE_COLOR = "#c5e6a4";
// A narrow decorative verge scales with the plan without obscuring nearby lots.
export const STREET_VERGE_WIDTH_M = 0.4;

// Only infer a direction for elongated four-sided streets. Irregular junctions
// keep a plain surface rather than receiving an arbitrary lane marking.
export function streetCenterLine(points: XY[]): [XY, XY] | undefined {
  if (points.length !== 4) return;
  const lengths = points.map((a, i) => {
    const b = points[(i + 1) % 4];
    return Math.hypot(b.x - a.x, b.y - a.y);
  });
  const first = lengths[0] + lengths[2] < lengths[1] + lengths[3] ? 0 : 1;
  const width = (lengths[first] + lengths[first + 2]) / 2;
  const length = (lengths[(first + 1) % 4] + lengths[(first + 3) % 4]) / 2;
  if (width <= 0 || length < width * 2) return;
  const midpoint = (i: number): XY => ({
    x: (points[i].x + points[(i + 1) % 4].x) / 2,
    y: (points[i].y + points[(i + 1) % 4].y) / 2,
  });
  const a = midpoint(first), b = midpoint(first + 2);
  const inset = Math.min(0.2, width / length * 0.6);
  return [
    { x: a.x + (b.x - a.x) * inset, y: a.y + (b.y - a.y) * inset },
    { x: b.x + (a.x - b.x) * inset, y: b.y + (a.y - b.y) * inset },
  ];
}
