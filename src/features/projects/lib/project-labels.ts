import { PROJECT_STAGE_LABELS } from "@/features/projects/data/project-catalogs";
import type { ProjectStage } from "@/features/projects/types/draft";
import type {
  ApiProjectStage,
  ApiProjectStatus,
  ProjectApiSummary,
} from "@/features/projects/types/api";

/** Paleta de badges de estado, compartida por todas las cards de proyecto del panel. */
export const PROJECT_STATUS_STYLE: Record<ApiProjectStatus, string> = {
  DRAFT: "bg-surface/90 text-muted",
  PENDING_REVIEW: "bg-warning/15 text-warning",
  PUBLISHED: "bg-success/12 text-success",
  PAUSED: "bg-warning/15 text-warning",
  SOLD: "bg-brand-soft text-brand",
  REJECTED: "bg-error/12 text-error",
  ARCHIVED: "bg-surface/90 text-muted",
};

const STAGE_TO_DRAFT: Record<ApiProjectStage, ProjectStage> = {
  PRE_SALE: "preventa",
  UNDER_CONSTRUCTION: "en-construccion",
  DELIVERED: "entregado",
};

/** Etiqueta legible de la fase comercial (preventa, en construcción, entregado). */
export function projectStageLabel(stage: ApiProjectStage): string {
  return PROJECT_STAGE_LABELS[STAGE_TO_DRAFT[stage]];
}

const AGENT_TYPE_LABELS: Record<string, string> = {
  DEVELOPER: "Desarrollador",
  REAL_ESTATE_AGENCY: "Inmobiliaria",
  INDEPENDENT_AGENT: "Agente",
  INDIVIDUAL_OWNER: "Propietario",
};

/** Quién.CREó el proyecto: ARIZ o un tercero del ecosistema. */
export function projectOriginLabel(project: ProjectApiSummary): string {
  if (project.origin === "ADMIN") return "ARIZ";
  return AGENT_TYPE_LABELS[project.agent?.type ?? ""] ?? "Externo";
}
