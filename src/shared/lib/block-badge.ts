import type { PlanZone } from "./site-plan";

const COLORS = ["#2563eb", "#7c3aed", "#0f766e", "#be185d", "#b45309", "#4338ca", "#0369a1", "#a21caf", "#4d7c0f", "#b91c1c", "#047857", "#c2410c", "#6d28d9", "#0e7490", "#9f1239", "#3f6212"];
export const BLOCK_BADGE_SIZE = 24;

export function blockBadge(zone: Pick<PlanZone, "id" | "name">, zones: PlanZone[]) {
  const blocks = zones.filter(item => item.kind === "BLOCK").sort((a, b) => a.id.localeCompare(b.id));
  const index = Math.max(0, blocks.findIndex(item => item.id === zone.id));
  const name = zone.name.trim().replace(/^(?:manzana|mz\.?)\s+/i, "");
  return { letter: Array.from(name)[0]?.toLocaleUpperCase("es") || "M", color: COLORS[index % COLORS.length] };
}
