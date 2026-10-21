type XY = { x: number; y: number };

/** Fit orientation and line layout to polygon geometry without directional preferences. */
export function fitPolygonText(
  text: string,
  radius: number,
  maxFont = 12,
  path?: XY[],
  anchor?: XY,
) {
  const clean = text.trim().replace(/\s+/g, " ");
  const words = clean.split(" ");
  const candidates: string[][] = [[clean]];
  for (const count of [2, 3]) {
    if (words.length < count) continue;
    const lines: string[] = [];
    let line = "";
    const target = clean.length / count;
    for (const word of words) {
      if (
        line &&
        line.length + word.length + 1 > target &&
        lines.length < count - 1
      ) {
        lines.push(line);
        line = word;
      } else line = line ? `${line} ${word}` : word;
    }
    if (line) lines.push(line);
    candidates.push(lines);
  }
  let best = { lines: [clean], size: 0.01, angle: 0 },
    bestScore = -1;
  const angles =
    path && anchor ? Array.from({ length: 18 }, (_, i) => i * 10 - 90) : [0];
  if (path && anchor) {
    path.forEach((a, i) => {
      const b = path[(i + 1) % path.length];
      if (Math.hypot(b.x - a.x, b.y - a.y) < 1e-10) return;
      let angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
      while (angle >= 90) angle -= 180;
      while (angle < -90) angle += 180;
      if (!angles.some((candidate) => Math.abs(candidate - angle) < 1e-7))
        angles.push(angle);
    });
  }
  const extent = path?.length
    ? Math.hypot(
        Math.max(...path.map((p) => p.x)) - Math.min(...path.map((p) => p.x)),
        Math.max(...path.map((p) => p.y)) - Math.min(...path.map((p) => p.y)),
      )
    : radius * 2;
  const inside = (p: XY) => {
    if (!path) return true;
    let yes = false;
    for (let i = 0, j = path.length - 1; i < path.length; j = i++) {
      const a = path[i],
        b = path[j];
      if (
        a.y > p.y !== b.y > p.y &&
        p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x
      )
        yes = !yes;
    }
    return yes;
  };
  const fits = (width: number, height: number, angle: number) => {
    if (!path || !anchor)
      return width <= radius * 1.25 && height <= radius * 1.25;
    const r = (angle * Math.PI) / 180;
    const corners = [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ].map(([x, y]) => ({
      x:
        anchor.x +
        ((x * width) / 2) * Math.cos(r) -
        ((y * height) / 2) * Math.sin(r),
      y:
        anchor.y +
        ((x * width) / 2) * Math.sin(r) +
        ((y * height) / 2) * Math.cos(r),
    }));
    if (!corners.every(inside)) return false;
    const cross = (a: XY, b: XY, c: XY) =>
      (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < path.length; j++) {
        const a = corners[i],
          b = corners[(i + 1) % 4],
          c = path[j],
          d = path[(j + 1) % path.length];
        if (
          cross(a, b, c) * cross(a, b, d) < 0 &&
          cross(c, d, a) * cross(c, d, b) < 0
        )
          return false;
      }
    return true;
  };
  for (const angle of angles)
    for (const lines of candidates) {
      const longest = Math.max(
        1,
        ...lines.map((line) => Array.from(line).length),
      );
      let low = 0,
        high = Math.max(
          0.01,
          extent / Math.max(longest * 1.1, lines.length * 1.4),
        );
      for (let i = 0; i < 20; i++) {
        const size = (low + high) / 2;
        if (fits(longest * size * 1.1, lines.length * size * 1.4, angle))
          low = size;
        else high = size;
      }
      const score = low;
      if (score > bestScore) {
        bestScore = score;
        best = { lines, size: Math.max(0.01, Math.min(maxFont, low)), angle };
      }
    }
  return best;
}

/** Find an interior label position with clearance from every polygon edge, including concave shapes. */
export function polygonLabel(path: XY[]) {
  if (path.length < 3)
    return { x: path[0]?.x ?? 0, y: path[0]?.y ?? 0, radius: 0 };
  const minX = Math.min(...path.map((p) => p.x)),
    maxX = Math.max(...path.map((p) => p.x));
  const minY = Math.min(...path.map((p) => p.y)),
    maxY = Math.max(...path.map((p) => p.y));
  const distance = (p: XY) => {
    let inside = false,
      nearest = Infinity;
    for (let i = 0, j = path.length - 1; i < path.length; j = i++) {
      const a = path[j],
        b = path[i];
      if (
        a.y > p.y !== b.y > p.y &&
        p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x
      )
        inside = !inside;
      const dx = b.x - a.x,
        dy = b.y - a.y;
      const t = Math.max(
        0,
        Math.min(
          1,
          ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1),
        ),
      );
      nearest = Math.min(
        nearest,
        Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy),
      );
    }
    return inside ? nearest : -nearest;
  };
  let best = { x: (minX + maxX) / 2, y: (minY + maxY) / 2, radius: -Infinity };
  best.radius = distance(best);
  for (let x = 0; x < 20; x++)
    for (let y = 0; y < 20; y++) {
      const p = {
        x: minX + ((x + 0.5) / 20) * (maxX - minX),
        y: minY + ((y + 0.5) / 20) * (maxY - minY),
      };
      const radius = distance(p);
      if (radius > best.radius) best = { ...p, radius };
    }
  let step = Math.max(maxX - minX, maxY - minY) / 20;
  for (let n = 0; n < 12; n++) {
    const origin = best;
    for (const dx of [-1, 0, 1])
      for (const dy of [-1, 0, 1]) {
        const p = { x: origin.x + dx * step, y: origin.y + dy * step };
        const radius = distance(p);
        if (radius > best.radius) best = { ...p, radius };
      }
    step /= 2;
  }
  // Prefer the polygon's area-weighted center when it has room for a label.
  // Concave polygons whose center falls outside retain a safe interior position.
  const origin = path[0];
  let area = 0, centerX = 0, centerY = 0;
  path.forEach((p, i) => {
    const q = path[(i + 1) % path.length];
    const ax = p.x - origin.x, ay = p.y - origin.y, bx = q.x - origin.x, by = q.y - origin.y;
    const cross = ax * by - bx * ay;
    area += cross; centerX += (ax + bx) * cross; centerY += (ay + by) * cross;
  });
  if (Math.abs(area) > 1e-12) {
    const center = { x: origin.x + centerX / (3 * area), y: origin.y + centerY / (3 * area) };
    const radius = distance(center);
    if (radius > 0 && radius >= best.radius * 0.65) return { ...center, radius };
  }
  return { ...best, radius: Math.max(0, best.radius) };
}
