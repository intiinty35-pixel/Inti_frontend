import { apiClient } from "@/shared/lib/api/client";
import { PROJECT_MEDIA_FOLDER, uploadToCloudinary } from "@/shared/lib/api/cloudinary";
import {
  FINANCING_CONDITION_LABELS,
  LOT_MODE_LABELS,
  PROJECT_CATEGORY_LABELS,
  PROJECT_CERTIFICATION_LABELS,
  PROJECT_SERVICE_LABELS,
  PROJECT_STAGE_LABELS,
} from "@/features/projects/data/project-catalogs";
import { isLotComplete, isMilestoneRowBlank } from "@/features/projects/lib/project-draft";
import type {
  ApiLotMode,
  ApiLotStatus,
  ApiProjectMediaType,
  ApiProjectStage,
} from "@/features/projects/types/api";
import type { ProjectApiSummary } from "@/features/projects/types/api";
import type {
  LotDraft,
  KeptMedia,
  LotMode,
  LotStatus,
  MilestoneDraft,
  ProjectCategory,
  ProjectCurrency,
  ProjectDraft,
  ProjectSocialLinks,
  ProjectStage,
  ServiceKey,
} from "@/features/projects/types/draft";

/**
 * Contrato del futuro `POST /projects`. Se construye con una función pura para
 * poder compararlo contra lo que el backend acepte, sin necesidad de red.
 *
 * `File` no se puede serializar, así que los adjuntos viajan como un descriptor
 * (`name`, `size`, `type`) y el upload real irá aparte, en multipart.
 */
export interface UploadedFileRef {
  name: string;
  size: number;
  type: string;
}

export interface CreateProjectLotPayload {
  lotNumber: string;
  block?: string;
  areaM2: number;
  frontM?: number;
  price: number;
  status: LotStatus;
  planLocation?: string;
  /** Solo en modo "grupo": cuántos lotes cubre esta ficha. */
  lotCount?: number;
}

export interface CreateProjectMilestonePayload {
  title: string;
  date: string;
  note?: string;
}

export interface CreateProjectPayload {
  category: ProjectCategory;
  categoryLabel: string;
  stage: ProjectStage;
  stageLabel: string;
  name: string;
  description: string;
  currency: ProjectCurrency;
  priceFrom: number;
  priceTo: number;

  ruc?: string;
  businessName?: string;
  downPayment?: number;
  monthlyPayment?: number;
  financing: string[];
  financingLabels: string[];
  totalBlocks?: number;
  totalLots?: number;

  social: ProjectSocialLinks;
  services: ServiceKey[];
  serviceLabels: string[];
  urbanizationName?: string;
  registryEntry?: string;
  amenities: string[];

  location: {
    department: string;
    province: string;
    district: string;
    zone?: string;
    street: string;
    streetNumber: string;
    lat?: number;
    lng?: number;
  };

  lotMode: keyof typeof LOT_MODE_LABELS;
  lots: CreateProjectLotPayload[];
  milestones: CreateProjectMilestonePayload[];
  constructionStart?: string;
  estimatedDelivery: string;
  certifications: string[];
  certificationLabels: string[];

  images: UploadedFileRef[];
  plans: UploadedFileRef[];
  renderImages: UploadedFileRef[];
  tourUrl?: string;
}

function describe(file: File): UploadedFileRef {
  return { name: file.name, size: file.size, type: file.type };
}

function trimOrUndefined(value: string | undefined): string | undefined {
  const text = value?.trim();
  return text ? text : undefined;
}

function toLotPayload(lot: LotDraft, isGroup: boolean): CreateProjectLotPayload {
  return {
    lotNumber: lot.lotNumber.trim(),
    block: trimOrUndefined(lot.block),
    areaM2: lot.areaM2 as number,
    frontM: lot.frontM,
    price: lot.price as number,
    status: lot.status,
    planLocation: trimOrUndefined(lot.planLocation),
    lotCount: isGroup ? lot.lotCount : undefined,
  };
}

function toMilestonePayload(milestone: MilestoneDraft): CreateProjectMilestonePayload {
  return {
    title: (milestone.title ?? "").trim(),
    date: milestone.date ?? "",
    note: trimOrUndefined(milestone.note),
  };
}

/**
 * Solo recibe borradores ya validados por `projectDraftSchema`, por eso las
 * aserciones de `as number` son seguras: el schema exige área y precio en toda
 * ficha completa.
 */
export function buildProjectPayload(draft: ProjectDraft): CreateProjectPayload {
  return {
    category: draft.category,
    categoryLabel: PROJECT_CATEGORY_LABELS[draft.category],
    stage: draft.stage,
    stageLabel: PROJECT_STAGE_LABELS[draft.stage],
    name: draft.name.trim(),
    description: draft.description.trim(),
    currency: draft.currency,
    priceFrom: draft.priceFrom as number,
    priceTo: draft.priceTo as number,

    ruc: trimOrUndefined(draft.ruc),
    businessName: trimOrUndefined(draft.businessName),
    downPayment: draft.downPayment,
    monthlyPayment: draft.monthlyPayment,
    financing: draft.financing,
    financingLabels: draft.financing.map((key) => FINANCING_CONDITION_LABELS[key] ?? key),
    totalBlocks: draft.totalBlocks,
    totalLots: draft.totalLots,

    social: {
      instagram: trimOrUndefined(draft.social.instagram),
      tiktok: trimOrUndefined(draft.social.tiktok),
      facebook: trimOrUndefined(draft.social.facebook),
      website: trimOrUndefined(draft.social.website),
    },
    services: draft.services,
    serviceLabels: draft.services.map((service) => PROJECT_SERVICE_LABELS[service]),
    urbanizationName: trimOrUndefined(draft.urbanizationName),
    registryEntry: trimOrUndefined(draft.registryEntry),
    amenities: draft.amenities,

    location: {
      department: draft.department,
      province: draft.province,
      district: draft.district,
      zone: trimOrUndefined(draft.zone),
      street: draft.street.trim(),
      streetNumber: draft.streetNumber.trim(),
      lat: draft.lat,
      lng: draft.lng,
    },

    lotMode: draft.lotMode,
    lots: draft.lots
      .filter(isLotComplete)
      .map((lot) => toLotPayload(lot, draft.lotMode === "grupo")),
    milestones: draft.milestones.filter((row) => !isMilestoneRowBlank(row)).map(toMilestonePayload),
    constructionStart: trimOrUndefined(draft.constructionStart),
    estimatedDelivery: draft.estimatedDelivery ?? "",
    certifications: draft.certifications,
    certificationLabels: draft.certifications.map(
      (key) => PROJECT_CERTIFICATION_LABELS[key] ?? key,
    ),

    images: draft.images.map(describe),
    plans: draft.plans.map(describe),
    renderImages: draft.renderImages.map(describe),
    tourUrl: trimOrUndefined(draft.tourUrl),
  };
}

// ---------------------------------------------------------------------------
// Contrato real del backend (`POST /projects`).
//
// El borrador usa claves en español para la UI; aquí se traducen a los enums
// que expone Prisma/NestJS (ProjectStage, LotMode, LotStatus, MediaType) y a
// los nombres de campo de la base de datos.
// ---------------------------------------------------------------------------

const STAGE_TO_API: Record<ProjectStage, ApiProjectStage> = {
  preventa: "PRE_SALE",
  "en-construccion": "UNDER_CONSTRUCTION",
  entregado: "DELIVERED",
};

const LOT_MODE_TO_API: Record<LotMode, ApiLotMode> = {
  individual: "INDIVIDUAL",
  grupo: "GROUP",
};

const LOT_STATUS_TO_API: Record<LotStatus, ApiLotStatus> = {
  disponible: "AVAILABLE",
  reservado: "RESERVED",
  vendido: "SOLD",
  bloqueado: "BLOCKED",
};

export interface ProjectMediaInput {
  type: ApiProjectMediaType;
  url: string;
  publicId?: string;
  position?: number;
  isCover?: boolean;
}

export interface CreateProjectLotInput {
  lotNumber: string;
  block?: string;
  areaM2: number;
  frontM?: number;
  price: number;
  status: ApiLotStatus;
  planLocation?: string;
  /** Solo en modo "grupo": cuántos lotes cubre esta ficha. */
  lotCount?: number;
}

export interface CreateProjectMilestoneInput {
  title: string;
  date: string;
  note?: string;
}

export interface CreateProjectInput {
  category: "LOTIZACION";
  stage: ApiProjectStage;
  name: string;
  description: string;
  currency: ProjectCurrency;
  priceFrom: number;
  priceTo: number;

  ruc?: string;
  businessName?: string;
  downPayment?: number;
  monthlyPayment?: number;
  financing?: string[];
  totalBlocks?: number;
  totalLots?: number;

  social?: ProjectSocialLinks;
  services?: ServiceKey[];
  urbanizationName?: string;
  registryEntry?: string;
  amenities?: string[];

  location: {
    department: string;
    province: string;
    district: string;
    zone?: string;
    street: string;
    streetNumber: string;
    latitude?: number;
    longitude?: number;
  };

  lotMode: ApiLotMode;
  lots: CreateProjectLotInput[];
  milestones?: CreateProjectMilestoneInput[];
  constructionStart?: string;
  estimatedDelivery: string;
  certifications?: string[];

  media: ProjectMediaInput[];
  tourUrl?: string;
}

export type ProjectLocationInput = CreateProjectInput["location"];

/** Traduce el borrador validado + los adjuntos ya subidos al cuerpo real del POST. */
export function toProjectInput(
  payload: CreateProjectPayload,
  media: ProjectMediaInput[],
): CreateProjectInput {
  return {
    category: "LOTIZACION",
    stage: STAGE_TO_API[payload.stage],
    name: payload.name,
    description: payload.description,
    currency: payload.currency,
    priceFrom: payload.priceFrom,
    priceTo: payload.priceTo,

    ruc: payload.ruc,
    businessName: payload.businessName,
    downPayment: payload.downPayment,
    monthlyPayment: payload.monthlyPayment,
    financing: payload.financing.length > 0 ? payload.financing : undefined,
    totalBlocks: payload.totalBlocks,
    totalLots: payload.totalLots,

    social: payload.social,
    services: payload.services.length > 0 ? payload.services : undefined,
    urbanizationName: payload.urbanizationName,
    registryEntry: payload.registryEntry,
    amenities: payload.amenities.length > 0 ? payload.amenities : undefined,

    location: {
      department: payload.location.department,
      province: payload.location.province,
      district: payload.location.district,
      zone: payload.location.zone,
      street: payload.location.street,
      streetNumber: payload.location.streetNumber,
      latitude: payload.location.lat,
      longitude: payload.location.lng,
    },

    lotMode: LOT_MODE_TO_API[payload.lotMode],
    lots: payload.lots.map((lot) => ({
      lotNumber: lot.lotNumber,
      block: lot.block,
      areaM2: lot.areaM2,
      frontM: lot.frontM,
      price: lot.price,
      status: LOT_STATUS_TO_API[lot.status],
      planLocation: lot.planLocation,
      lotCount: lot.lotCount,
    })),
    milestones:
      payload.milestones.length > 0
        ? payload.milestones.map((milestone) => ({
            title: milestone.title,
            date: milestone.date,
            note: milestone.note,
          }))
        : undefined,
    constructionStart: payload.constructionStart,
    estimatedDelivery: payload.estimatedDelivery,
    certifications: payload.certifications.length > 0 ? payload.certifications : undefined,

    media,
    tourUrl: payload.tourUrl,
  };
}

const ALLOWED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_MEDIA_SIZE_MB = 12;

/** Sube archivos a Cloudinary y arma las entradas de `media` del proyecto. */
export async function uploadProjectFiles(
  files: readonly File[],
  type: ApiProjectMediaType,
  startPosition = 0,
): Promise<ProjectMediaInput[]> {
  const uploads: ProjectMediaInput[] = [];

  for (const [index, file] of files.entries()) {
    if (!ALLOWED_MEDIA_TYPES.includes(file.type)) {
      throw new Error("Solo se permiten imágenes JPG, PNG, WebP o PDF.");
    }
    if (file.size > MAX_MEDIA_SIZE_MB * 1024 * 1024) {
      throw new Error(`Cada archivo debe pesar como máximo ${MAX_MEDIA_SIZE_MB} MB.`);
    }

    const uploaded = await uploadToCloudinary(
      file,
      PROJECT_MEDIA_FOLDER,
      file.type === "application/pdf" ? "raw" : "image",
    );
    uploads.push({
      type,
      url: uploaded.url,
      publicId: uploaded.publicId,
      position: startPosition + index,
      isCover: type === "IMAGE" && index === 0,
    });
  }

  return uploads;
}

export async function createProject(input: CreateProjectInput): Promise<ProjectApiSummary> {
  return apiClient.post<ProjectApiSummary>("/projects", input);
}

export async function updateProject(id: string, input: CreateProjectInput): Promise<ProjectApiSummary> {
  return apiClient.patch<ProjectApiSummary>(`/projects/${encodeURIComponent(id)}`, input);
}

/**
 * Junta la multimedia conservada y la recien subida en el orden final
 * (imagenes, planos, renders); la primera imagen es la portada.
 */
export function mergeProjectMedia(
  kept: readonly KeptMedia[],
  uploaded: readonly ProjectMediaInput[],
): ProjectMediaInput[] {
  const keptInputs: ProjectMediaInput[] = kept.map((media) => ({
    type: media.type,
    url: media.url,
    publicId: media.publicId ?? undefined,
  }));
  const all = [...keptInputs, ...uploaded];
  const ordered = (["IMAGE", "FLOOR_PLAN", "RENDER"] as const).flatMap((type) =>
    all.filter((media) => media.type === type),
  );
  return ordered.map((media, index) => ({
    ...media,
    position: index,
    isCover: media.type === "IMAGE" && index === 0,
  }));
}

export async function createAdminProject(input: CreateProjectInput): Promise<ProjectApiSummary> {
  return apiClient.post<ProjectApiSummary>("/admin/projects", input);
}

export async function publishProject(id: string): Promise<ProjectApiSummary> {
  return apiClient.patch<ProjectApiSummary>(`/projects/${encodeURIComponent(id)}/publish`);
}

export async function publishAdminProject(id: string): Promise<ProjectApiSummary> {
  return apiClient.patch<ProjectApiSummary>(`/admin/projects/${encodeURIComponent(id)}/publish`);
}

export async function updateProjectLocation(
  id: string,
  location: ProjectLocationInput,
): Promise<ProjectApiSummary> {
  return apiClient.patch<ProjectApiSummary>(`/projects/${encodeURIComponent(id)}/location`, location);
}

export async function updateAdminProjectLocation(
  id: string,
  location: ProjectLocationInput,
): Promise<ProjectApiSummary> {
  return apiClient.patch<ProjectApiSummary>(`/admin/projects/${encodeURIComponent(id)}/location`, location);
}

export async function getOwnerProjects(): Promise<ProjectApiSummary[]> {
  return apiClient.get<ProjectApiSummary[]>("/projects/owner/me");
}
