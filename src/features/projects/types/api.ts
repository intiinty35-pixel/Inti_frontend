/**
 * Contrato de lectura del backend (`GET /projects`, `GET /projects/owner/me`).
 *
 * El resumen público y el detalle del propietario comparten casi todos los
 * campos; la ubicación llega como `lat`/`lng` en el resumen y como
 * `latitude`/`longitude` en el detalle, por eso se modelan los dos nombres.
 */

export type ApiProjectCategory = "LOTIZACION";

export type ApiProjectStage = "PRE_SALE" | "UNDER_CONSTRUCTION" | "DELIVERED";

export type ApiProjectStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "PUBLISHED"
  | "PAUSED"
  | "SOLD"
  | "REJECTED"
  | "ARCHIVED";

export type ApiProjectOrigin = "AGENT" | "ADMIN";

export type ApiLotMode = "INDIVIDUAL" | "GROUP";

export type ApiLotStatus = "AVAILABLE" | "RESERVED" | "SOLD" | "BLOCKED";

export type ApiProjectMediaType = "IMAGE" | "FLOOR_PLAN" | "RENDER";

export type ApiCurrency = "PEN" | "USD";

export interface ProjectApiLocation {
  department: string;
  province: string;
  district: string;
  country?: string;
  zone?: string | null;
  street?: string;
  streetNumber?: string;
  lat?: number | null;
  lng?: number | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ProjectApiSummary {
  id: string;
  origin: ApiProjectOrigin;
  slug: string;
  name: string;
  description: string;
  category: ApiProjectCategory;
  stage: ApiProjectStage;
  lotMode: ApiLotMode;
  currency: ApiCurrency;
  priceFrom: number;
  priceTo: number;
  totalLots: number | null;
  lotsCount: number;
  cheapestLotPrice?: number;
  areaRange: { min: number; max: number };
  developer: string;
  estimatedDelivery: string;
  location: ProjectApiLocation;
  coverImage?: string;
  images: string[];
  tourUrl?: string | null;
  status: ApiProjectStatus;
  featured: boolean;
  publishedAt: string;
}

export interface ProjectApiPaged {
  items: ProjectApiSummary[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ProjectApiLot {
  id: string;
  lotNumber: string;
  block: string | null;
  areaM2: number;
  frontM: number | null;
  price: number;
  status: ApiLotStatus;
  planLocation: string | null;
  lotCount: number | null;
}

export interface ProjectApiMilestone {
  id: string;
  title: string;
  date: string;
  note: string | null;
}

export interface ProjectApiMedia {
  id: string;
  type: string;
  url: string;
  publicId: string | null;
  position: number;
  isCover: boolean;
}

export interface ProjectApiAgent {
  id: string | null;
  name: string;
  type: string;
  status: string;
  whatsapp: string | null;
  phone: string | null;
  email: string;
}

export interface ProjectApiDetail extends ProjectApiSummary {
  ruc: string | null;
  businessName: string | null;
  downPayment: number | null;
  monthlyPayment: number | null;
  financing: string[];
  totalBlocks: number | null;
  social: Record<string, string> | null;
  services: string[];
  urbanizationName: string | null;
  registryEntry: string | null;
  amenities: string[];
  tourUrl: string | null;
  constructionStart: string | null;
  certifications: string[];
  lots: ProjectApiLot[];
  milestones: ProjectApiMilestone[];
  media: ProjectApiMedia[];
  agent: ProjectApiAgent;
  createdAt: string;
  updatedAt: string;
}

export const PROJECT_STATUS_LABELS: Record<ApiProjectStatus, string> = {
  DRAFT: "Borrador",
  PENDING_REVIEW: "En revisión",
  PUBLISHED: "Publicado",
  PAUSED: "Pausado",
  SOLD: "Vendido",
  REJECTED: "Rechazado",
  ARCHIVED: "Archivado",
};
