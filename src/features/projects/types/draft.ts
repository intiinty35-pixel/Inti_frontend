export type ProjectStage = "preventa" | "en-construccion" | "entregado";

export type ProjectCategory = "lotizacion" | "departamentos";

export type ProjectCurrency = "PEN" | "USD";

export type ServiceKey =
  | "habilitacion-urbana"
  | "titulo-propiedad"
  | "agua"
  | "electricidad"
  | "desague"
  | "pistas"
  | "alumbrado-publico"
  | "gas-natural";

/**
 * Estado de un lote dentro del inventario. `ListingStatus` no contempla
 * "bloqueado", que en lotización sirve para retenciones internas del
 * desarrollador, así que el inventario lleva su propio tipo.
 */
export type LotStatus = "disponible" | "reservado" | "vendido" | "bloqueado";

export type LotMode = "individual" | "grupo";

export interface ProjectSocialLinks {
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  website?: string;
}

export interface LotDraft {
  lotNumber: string;
  block?: string;
  areaM2?: number;
  frontM?: number;
  price?: number;
  status: LotStatus;
  planLocation?: string;
  /** Solo en modo "grupo": cuántos lotes cubre esta ficha. */
  lotCount?: number;
}

export interface MilestoneDraft {
  title: string;
  date: string;
  note?: string;
}

/** Archivo multimedia que el proyecto ya tiene guardado (modo edicion). */
export interface KeptMedia {
  type: "IMAGE" | "FLOOR_PLAN" | "RENDER";
  url: string;
  publicId?: string | null;
}

export interface ProjectDraft {
  category: ProjectCategory;
  stage: ProjectStage;
  name: string;
  description: string;
  currency: ProjectCurrency;
  priceFrom?: number;
  priceTo?: number;

  /** Cadena vacía significa "sin llenar"; el schema acepta `""` o 11 dígitos. */
  ruc: string;
  businessName?: string;
  downPayment?: number;
  monthlyPayment?: number;
  /** Claves de `FINANCING_CONDITIONS`; el textarea libre se eliminó. */
  financing: string[];
  totalBlocks?: number;
  totalLots?: number;

  social: ProjectSocialLinks;
  services: ServiceKey[];
  urbanizationName?: string;
  registryEntry?: string;
  amenities: string[];

  department: string;
  province: string;
  district: string;
  zone?: string;
  street: string;
  streetNumber: string;
  lat?: number;
  lng?: number;

  lotMode: LotMode;
  lots: LotDraft[];

  /** Cadena vacía significa "sin llenar"; el schema acepta `""` o `YYYY-MM-DD`. */
  constructionStart: string;
  estimatedDelivery: string;
  milestones: MilestoneDraft[];
  /** Claves de `PROJECT_CERTIFICATIONS`; el textarea libre se eliminó. */
  certifications: string[];

  /** Multimedia ya guardada que se conserva al editar; vacia al crear. */
  keptMedia: KeptMedia[];
  images: File[];
  plans: File[];
  tourUrl?: string;
  tourVideo?: File;
  renderImages: File[];
}

export const MAX_PROJECT_IMAGES = 10;
export const MAX_PLAN_FILES = 8;
export const MAX_PLAN_SIZE_MB = 20;
export const MAX_RENDER_IMAGES = 8;
export const MIN_DESCRIPTION_LENGTH = 50;
