import { backendFetch } from "@/shared/lib/api/server";
import { env } from "@/shared/lib/env";
import type { ProjectApiDetail, ProjectApiPaged } from "@/features/projects/types/api";

const PUBLIC_REVALIDATE_SECONDS = 60;

/**
 * El catalogo publico no necesita la cookie de sesion, asi que se pide con
 * cache de ISR: la home sigue siendo estatica y se refresca sola cuando alguien
 * publica un proyecto.
 */
export async function getPublicProjectsServer(pageSize = 10): Promise<ProjectApiPaged> {
  const response = await fetch(`${env.backendUrl}/projects?pageSize=${pageSize}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: PUBLIC_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`No se pudieron cargar los proyectos (${response.status})`);
  }

  return (await response.json()) as ProjectApiPaged;
}

/** Detalle publico de un proyecto ya publicado. Throw si el slug no existe. */
export async function getProjectBySlugServer(slug: string): Promise<ProjectApiDetail> {
  const response = await fetch(`${env.backendUrl}/projects/${encodeURIComponent(slug)}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: PUBLIC_REVALIDATE_SECONDS },
  });

  if (response.status === 404) {
    throw new Error("Proyecto no encontrado");
  }
  if (!response.ok) {
    throw new Error(`No se pudo cargar el proyecto (${response.status})`);
  }

  return (await response.json()) as ProjectApiDetail;
}

/** Proyectos del agente, en cualquier estado (borrador, publicado, pausado…). */
export async function getOwnerProjectsPagedServer(
  page: number,
  pageSize = 6,
): Promise<ProjectApiPaged> {
  const response = await backendFetch(`/projects/owner/me?page=${page}&pageSize=${pageSize}`);

  if (!response.ok) {
    throw new Error(`No se pudieron cargar tus proyectos (${response.status})`);
  }

  return (await response.json()) as ProjectApiPaged;
}
