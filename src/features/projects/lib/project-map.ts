import type { Listing } from "@/features/listings/types/listing";
import type { ProjectApiSummary } from "@/features/projects/types/api";

/**
 * Adapta un proyecto publicado a la forma de una publicacion del mapa. Solo se
 * muestran los proyectos con coordenadas: sin punto no hay donde dibujarlos.
 */
export function projectToMapListing(project: ProjectApiSummary): Listing | null {
  const lat = project.location.lat ?? project.location.latitude;
  const lng = project.location.lng ?? project.location.longitude;
  if (typeof lat !== "number" || typeof lng !== "number") return null;

  const address =
    project.location.street && project.location.streetNumber
      ? `${project.location.street} ${project.location.streetNumber}`
      : project.location.street || undefined;

  return {
    id: `project-${project.id}`,
    slug: project.slug,
    title: project.name,
    description: project.description,
    operation: "buy",
    type: "projects",
    price: { amount: project.cheapestLotPrice ?? project.priceFrom, currency: project.currency, period: "total" },
    location: {
      department: project.location.department,
      province: project.location.province,
      district: project.location.district,
      address,
      lat,
      lng,
    },
    images: project.images ?? (project.coverImage ? [project.coverImage] : []),
    rooms: 0,
    bathrooms: 0,
    areaM2: project.areaRange?.min ?? 0,
    status: "disponible",
    publishedAt: project.publishedAt,
  };
}
