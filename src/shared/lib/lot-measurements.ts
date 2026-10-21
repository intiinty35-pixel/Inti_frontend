export function rectangularSides(dimensions: string) {
  const match = dimensions.trim().match(/^(\d+(?:[.,]\d+)?)\s*(?:m\s*)?[x×*]\s*(\d+(?:[.,]\d+)?)\s*m?$/i);
  if (!match) return undefined;
  return { front: Number(match[1].replace(',', '.')), depth: Number(match[2].replace(',', '.')) };
}

export function rectangularMetrics(front: number, depth: number) {
  if (!Number.isFinite(front) || !Number.isFinite(depth) || front <= 0 || depth <= 0) return undefined;
  return {
    frontM: front,
    areaM2: Math.round(front * depth * 100) / 100,
    perimeterM: Math.round(2 * (front + depth) * 100) / 100,
  };
}
