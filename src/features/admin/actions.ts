"use server";

import { backendFetch } from "@/shared/lib/api/server";
import type { PropertyDetail } from "@/features/listings/types/listing";
import type { ProjectApiDetail } from "@/features/projects/types/api";

export type AgencyPublicationDetail =
  | { kind: "property"; detail: PropertyDetail }
  | { kind: "project"; detail: ProjectApiDetail }
  | { kind: "error"; message: string };

export async function getAgencyPublicationDetails(
  kind: "property" | "project",
  id: string,
): Promise<AgencyPublicationDetail> {
  if (!id) {
    return { kind: "error", message: "No se encontró el identificador de la publicación." };
  }

  const resource = kind === "project" ? "projects" : "properties";
  const response = await backendFetch(
    `/admin/agencies/${resource}/${encodeURIComponent(id)}`,
  );

  if (!response.ok) {
    return {
      kind: "error",
      message: `No se pudo cargar el detalle de la publicación (${response.status}).`,
    };
  }

  const detail: unknown = await response.json();
  return kind === "project"
    ? { kind, detail: detail as ProjectApiDetail }
    : { kind, detail: detail as PropertyDetail };
}
