import { backendFetch } from "@/shared/lib/api/server";
import { env } from "@/shared/lib/env";
import type { ApiProjectStatus, ProjectApiDetail, ProjectApiPaged } from "@/features/projects/types/api";

const PUBLIC_REVALIDATE_SECONDS = 60;

/**
 * El catalogo publico no necesita la cookie de sesion, asi que se pide con
 * cache de ISR: la home sigue siendo estatica y se refresca sola cuando alguien
 * publica un proyecto.
 */
export async function getPublicProjectsServer(
  pageSize = 10,
  origin?: "ADMIN" | "AGENT",
  sort?: "recent" | "price-asc" | "price-desc" | "featured",
  page = 1,
): Promise<ProjectApiPaged> {
  const params = new URLSearchParams({ pageSize: String(pageSize), page: String(page) });
  if (origin) params.set("origin", origin);
  if (sort) params.set("sort", sort);
  const response = await fetch(`${env.backendUrl}/projects?${params.toString()}`, {
    headers: { Accept: "application/json" },
    ...(origin === "ADMIN"
      ? { cache: "no-store" as const }
      : { next: { revalidate: PUBLIC_REVALIDATE_SECONDS } }),
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

/** Detalle completo de un proyecto del agente, para editarlo. `null` si no es suyo o no existe. */
export async function getOwnerProjectDetailServer(id: string): Promise<ProjectApiDetail | null> {
  const response = await backendFetch("/projects/owner/me");

  if (!response.ok) {
    throw new Error(`No se pudieron cargar tus proyectos (${response.status})`);
  }

  const projects = (await response.json()) as ProjectApiDetail[];
  return projects.find((project) => project.id === id) ?? null;
}

/** Proyectos creados desde el panel ARIZ; status permite consultar borradores únicamente. */
export async function getAdminProjectsPagedServer(
  page: number,
  status?: ApiProjectStatus,
  pageSize = 9,
): Promise<ProjectApiPaged> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (status) params.set("status", status);

  const response = await backendFetch(`/admin/projects?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`No se pudieron cargar los proyectos de ARIZ (${response.status})`);
  }

  return (await response.json()) as ProjectApiPaged;
}

/** Detalle completo de un proyecto creado desde el panel ARIZ, para editarlo. */
export async function getAdminProjectDetailServer(id: string): Promise<ProjectApiDetail | null> {
  const response = await backendFetch(`/admin/projects/${encodeURIComponent(id)}`);

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`No se pudo cargar el proyecto de ARIZ (${response.status})`);
  }

  return (await response.json()) as ProjectApiDetail;
}
