import type { Currency, LocationRef } from "@/features/listings/types/listing";
import type { Project, ProjectStatus } from "@/features/listings/types/project";
import { PROJECT_STAGE_LABELS } from "@/features/projects/data/project-catalogs";
import type { ProjectStage } from "@/features/projects/types/draft";
import type { ApiProjectStage, ProjectApiLocation, ProjectApiSummary } from "@/features/projects/types/api";

const STAGE_TO_DOMAIN: Record<ApiProjectStage, ProjectStatus> = {
  PRE_SALE: "preventa",
  UNDER_CONSTRUCTION: "en-construccion",
  DELIVERED: "entregado",
};

function toLocationRef(location: ProjectApiLocation): LocationRef {
  const address =
    location.street && location.streetNumber
      ? `${location.street} ${location.streetNumber}`
      : location.street || undefined;

  return {
    department: location.department,
    province: location.province,
    district: location.district,
    address,
    lat: location.lat ?? location.latitude ?? undefined,
    lng: location.lng ?? location.longitude ?? undefined,
  };
}

/**
 * Adapta el contrato del backend a la tarjeta de proyectos que ya usa el home,
 * para no duplicar el diseño. Los datos ausentes se omiten en vez de inventarse.
 */
export function toProjectCardModel(project: ProjectApiSummary): Project {
  const stage: ProjectStage = STAGE_TO_DOMAIN[project.stage];

  return {
    id: project.id,
    slug: project.slug,
    name: project.name,
    developer: project.developer,
    description: project.description,
    propertyType: "projects",
    location: toLocationRef(project.location),
    images: project.images.length > 0 ? project.images : project.coverImage ? [project.coverImage] : [],
    startingPrice: {
      amount: project.priceFrom,
      currency: project.currency as Currency,
      period: "total",
    },
    areaRange: project.areaRange,
    lotsTotal: project.totalLots ?? project.lotsCount,
    lotsLabel: "lotes",
    deliveryAt: project.estimatedDelivery,
    deliveryStage: PROJECT_STAGE_LABELS[stage],
    features: [],
    status: stage,
  };
}
