import { formatNumber, formatPrice } from "@/shared/lib/format";
import { LOT_STATUS_LABELS, LOT_STATUS_TONES, PROJECT_AMENITY_LABELS, PROJECT_SERVICE_LABELS } from "@/features/projects/data/project-catalogs";
import { isLotComplete } from "@/features/projects/lib/project-draft";
import type { LotDraft, LotMode, LotStatus } from "@/features/projects/types/draft";

export interface ProjectTotals {
  filledLots: number;
  blankLots: number;
  /** Lotes reales representados: en modo grupo suma la cantidad de cada ficha. */
  totalUnits: number;
  totalAreaM2: number;
  totalPrice: number;
  cheapestPrice?: number;
  dearestPrice?: number;
  byStatus: Record<LotStatus, number>;
  blocks: string[];
}

export function summarizeLots(lots: readonly LotDraft[], mode: LotMode = "individual"): ProjectTotals {
  const byStatus: Record<LotStatus, number> = {
    disponible: 0,
    reservado: 0,
    vendido: 0,
    bloqueado: 0,
  };
  const isGroup = mode === "grupo";

  let filledLots = 0;
  let blankLots = 0;
  let totalUnits = 0;
  let totalAreaM2 = 0;
  let totalPrice = 0;
  let cheapestPrice: number | undefined;
  let dearestPrice: number | undefined;
  const blocks = new Set<string>();

  for (const lot of lots) {
    if (!isLotComplete(lot)) {
      blankLots += 1;
      continue;
    }

    const units = isGroup ? Math.max(1, lot.lotCount ?? 1) : 1;

    filledLots += 1;
    totalUnits += units;
    byStatus[lot.status] += units;
    totalAreaM2 += (lot.areaM2 ?? 0) * units;
    totalPrice += (lot.price ?? 0) * units;
    cheapestPrice = cheapestPrice === undefined ? lot.price : Math.min(cheapestPrice, lot.price ?? 0);
    dearestPrice = dearestPrice === undefined ? lot.price : Math.max(dearestPrice, lot.price ?? 0);

    if (lot.block?.trim()) {
      blocks.add(lot.block.trim());
    }
  }

  return {
    filledLots,
    blankLots,
    totalUnits,
    totalAreaM2,
    totalPrice,
    cheapestPrice,
    dearestPrice,
    byStatus,
    blocks: [...blocks].sort((a, b) => a.localeCompare(b, "es")),
  };
}

interface LocationParts {
  department: string;
  province: string;
  district: string;
  zone?: string;
  street: string;
  streetNumber: string;
}

export function formatLocation(draft: Partial<LocationParts>): string {
  const street = [draft.street, draft.streetNumber ? `N.º ${draft.streetNumber}` : ""]
    .filter(Boolean)
    .join(" ");

  return [street, draft.zone, draft.district, draft.province, draft.department]
    .filter(Boolean)
    .join(" · ");
}

export function formatAmenityLabels(values: readonly string[]): string[] {
  return values.map((value) => PROJECT_AMENITY_LABELS[value] ?? value);
}

export { LOT_STATUS_LABELS, LOT_STATUS_TONES, PROJECT_SERVICE_LABELS, formatNumber, formatPrice };
