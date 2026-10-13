import type { FieldPath } from "react-hook-form";
import type { LotDraft, MilestoneDraft, ProjectDraft } from "@/features/projects/types/draft";

export function createEmptyLot(): LotDraft {
  return {
    lotNumber: "",
    status: "disponible",
  };
}

export function createEmptyMilestone(): MilestoneDraft {
  return {
    title: "",
    date: "",
  };
}

/** Una ficha ya tiene número, área y precio; antes de eso solo hay un casillero vacío. */
export function isLotComplete(lot: LotDraft): boolean {
  return Boolean(lot.lotNumber.trim() && lot.areaM2 !== undefined && lot.price !== undefined);
}

/** Un hito en blanco se descarta al construir el payload, no bloquea el guardado. */
export function isMilestoneRowBlank(milestone: MilestoneDraft): boolean {
  return !milestone.title?.trim() && !milestone.date?.trim() && !milestone.note?.trim();
}

function emptyLotRows(count: number): LotDraft[] {
  return Array.from({ length: count }, createEmptyLot);
}

export const PROJECT_DRAFT_DEFAULTS: ProjectDraft = {
  category: "lotizacion",
  stage: "preventa",
  name: "",
  description: "",
  currency: "PEN",
  priceFrom: undefined,
  priceTo: undefined,

  ruc: "",
  businessName: "",
  downPayment: undefined,
  monthlyPayment: undefined,
  financing: ["cash"],
  totalBlocks: undefined,
  totalLots: undefined,

  social: { instagram: "", tiktok: "", facebook: "", website: "" },
  services: [],
  urbanizationName: "",
  registryEntry: "",
  amenities: [],

  department: "",
  province: "",
  district: "",
  zone: "",
  street: "",
  streetNumber: "",
  lat: undefined,
  lng: undefined,

  lotMode: "individual",
  lots: [createEmptyLot()],

  constructionStart: "",
  estimatedDelivery: "",
  milestones: [],
  certifications: [],

  images: [],
  plans: [],
  tourUrl: "",
  renderImages: [],
};

/** Rutas de un paso con su cantidad de errores, para el resumen del stepper. */
export function countStepErrors(
  errors: Record<string, unknown>,
  fields: readonly FieldPath<ProjectDraft>[],
): number {
  return fields.reduce((total, field) => {
    let current: unknown = errors;

    for (const segment of field.split(".")) {
      if (Array.isArray(current)) {
        current = current[Number(segment)];
      } else if (typeof current === "object" && current !== null) {
        current = (current as Record<string, unknown>)[segment];
      } else {
        return total;
      }
    }

    if (Array.isArray(current) && current.length > 0) {
      return total + current.length;
    }

    return current ? total + 1 : total;
  }, 0);
}

export function appendEmptyLots(lots: LotDraft[], count: number): LotDraft[] {
  return [...lots, ...emptyLotRows(count)];
}
