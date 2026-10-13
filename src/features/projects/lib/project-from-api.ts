import { PROJECT_DRAFT_DEFAULTS } from "@/features/projects/lib/project-draft";
import type {
  ApiLotMode,
  ApiLotStatus,
  ApiProjectStage,
  ProjectApiDetail,
} from "@/features/projects/types/api";
import type {
  KeptMedia,
  LotMode,
  LotStatus,
  ProjectDraft,
  ProjectStage,
  ServiceKey,
} from "@/features/projects/types/draft";

const STAGE_FROM_API: Record<ApiProjectStage, ProjectStage> = {
  PRE_SALE: "preventa",
  UNDER_CONSTRUCTION: "en-construccion",
  DELIVERED: "entregado",
};

const LOT_MODE_FROM_API: Record<ApiLotMode, LotMode> = {
  INDIVIDUAL: "individual",
  GROUP: "grupo",
};

const LOT_STATUS_FROM_API: Record<ApiLotStatus, LotStatus> = {
  AVAILABLE: "disponible",
  RESERVED: "reservado",
  SOLD: "vendido",
  BLOCKED: "bloqueado",
};

const MEDIA_TYPES = new Set(["IMAGE", "FLOOR_PLAN", "RENDER"]);

const optionalNumber = (value: number | string | null | undefined) =>
  value === null || value === undefined ? undefined : Number(value);

const dateOnly = (value: string | null | undefined) => (value ? value.slice(0, 10) : "");

/** Convierte el detalle guardado de un proyecto en el borrador que edita el asistente. */
export function projectDetailToDraft(project: ProjectApiDetail): ProjectDraft {
  const location = project.location;
  const keptMedia = [...project.media]
    .sort((a, b) => a.position - b.position)
    .filter((media) => MEDIA_TYPES.has(media.type))
    .map<KeptMedia>((media) => ({
      type: media.type as KeptMedia["type"],
      url: media.url,
      publicId: media.publicId,
    }));

  return {
    ...PROJECT_DRAFT_DEFAULTS,
    category: "lotizacion",
    stage: STAGE_FROM_API[project.stage],
    name: project.name,
    description: project.description,
    priceFrom: optionalNumber(project.priceFrom),
    priceTo: optionalNumber(project.priceTo),

    ruc: project.ruc ?? "",
    businessName: project.businessName ?? "",
    downPayment: optionalNumber(project.downPayment),
    monthlyPayment: optionalNumber(project.monthlyPayment),
    financing: project.financing.length > 0 ? project.financing : ["cash"],
    totalBlocks: optionalNumber(project.totalBlocks),
    totalLots: optionalNumber(project.totalLots),

    social: {
      instagram: project.social?.instagram ?? "",
      tiktok: project.social?.tiktok ?? "",
      facebook: project.social?.facebook ?? "",
      website: project.social?.website ?? "",
    },
    services: project.services as ServiceKey[],
    urbanizationName: project.urbanizationName ?? "",
    registryEntry: project.registryEntry ?? "",
    amenities: project.amenities,

    department: location.department,
    province: location.province,
    district: location.district,
    zone: location.zone ?? "",
    street: location.street ?? "",
    streetNumber: location.streetNumber ?? "",
    lat: optionalNumber(location.latitude ?? location.lat),
    lng: optionalNumber(location.longitude ?? location.lng),

    lotMode: LOT_MODE_FROM_API[project.lotMode],
    lots:
      project.lots.length > 0
        ? project.lots.map((lot) => ({
            lotNumber: lot.lotNumber,
            block: lot.block ?? undefined,
            areaM2: Number(lot.areaM2),
            frontM: optionalNumber(lot.frontM),
            price: Number(lot.price),
            status: LOT_STATUS_FROM_API[lot.status],
            planLocation: lot.planLocation ?? undefined,
            lotCount: lot.lotCount ?? undefined,
          }))
        : PROJECT_DRAFT_DEFAULTS.lots,

    constructionStart: dateOnly(project.constructionStart),
    estimatedDelivery: dateOnly(project.estimatedDelivery),
    milestones: project.milestones.map((milestone) => ({
      title: milestone.title,
      date: dateOnly(milestone.date),
      note: milestone.note ?? undefined,
    })),
    certifications: project.certifications,

    keptMedia,
    images: [],
    plans: [],
    tourUrl: project.tourUrl ?? "",
    renderImages: [],
  };
}
