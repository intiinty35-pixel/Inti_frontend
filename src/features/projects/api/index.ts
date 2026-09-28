import {
  LOT_MODE_LABELS,
  PROJECT_CATEGORY_LABELS,
  PROJECT_SERVICE_LABELS,
  PROJECT_STAGE_LABELS,
} from "@/features/projects/data/project-catalogs";
import { isLotComplete, isMilestoneRowBlank } from "@/features/projects/lib/project-draft";
import type {
  LotDraft,
  LotStatus,
  MilestoneDraft,
  ProjectCategory,
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
  planImage?: UploadedFileRef;
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
  currency: "PEN";
  priceFrom: number;
  priceTo: number;

  ruc?: string;
  businessName?: string;
  downPayment?: number;
  monthlyPayment?: number;
  financingInfo?: string;
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
  certifications?: string;

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

function toLotPayload(lot: LotDraft): CreateProjectLotPayload {
  return {
    lotNumber: lot.lotNumber.trim(),
    block: trimOrUndefined(lot.block),
    areaM2: lot.areaM2 as number,
    frontM: lot.frontM,
    price: lot.price as number,
    status: lot.status,
    planLocation: trimOrUndefined(lot.planLocation),
    planImage: lot.planImage ? describe(lot.planImage) : undefined,
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
    currency: "PEN",
    priceFrom: draft.priceFrom as number,
    priceTo: draft.priceTo as number,

    ruc: trimOrUndefined(draft.ruc),
    businessName: trimOrUndefined(draft.businessName),
    downPayment: draft.downPayment,
    monthlyPayment: draft.monthlyPayment,
    financingInfo: trimOrUndefined(draft.financingInfo),
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
    lots: draft.lots.filter(isLotComplete).map(toLotPayload),
    milestones: draft.milestones.filter((row) => !isMilestoneRowBlank(row)).map(toMilestonePayload),
    constructionStart: trimOrUndefined(draft.constructionStart),
    estimatedDelivery: draft.estimatedDelivery ?? "",
    certifications: trimOrUndefined(draft.certifications),

    images: draft.images.map(describe),
    plans: draft.plans.map(describe),
    renderImages: draft.renderImages.map(describe),
    tourUrl: trimOrUndefined(draft.tourUrl),
  };
}
