import Link from "next/link";
import { PinIcon } from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import { ROUTES } from "@/shared/config/routes";
import { formatArea, formatPrice } from "@/shared/lib/format";
import { PROJECT_STATUS_LABELS, type ApiProjectStatus, type ProjectApiSummary } from "@/features/projects/types/api";
import { PROJECT_STAGE_LABELS } from "@/features/projects/data/project-catalogs";
import type { ProjectStage } from "@/features/projects/types/draft";
import { DataCell, DataGrid } from "@/features/listings/components/data-grid";
import { ListingImage } from "@/features/listings/components/listing-image";

const STATUS_STYLE: Record<ApiProjectStatus, string> = {
  DRAFT: "bg-surface/90 text-muted",
  PENDING_REVIEW: "bg-warning/15 text-warning",
  PUBLISHED: "bg-success/12 text-success",
  PAUSED: "bg-warning/15 text-warning",
  SOLD: "bg-brand-soft text-brand",
  REJECTED: "bg-error/12 text-error",
  ARCHIVED: "bg-surface/90 text-muted",
};

const STAGE_LABELS: Record<string, ProjectStage> = {
  PRE_SALE: "preventa",
  UNDER_CONSTRUCTION: "en-construccion",
  DELIVERED: "entregado",
};

export function OwnerProjectCard({ project }: { project: ProjectApiSummary }) {
  const district = project.location.district;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)] transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]">
      <div className="relative">
        <ListingImage src={project.coverImage ?? project.images[0]} className="h-40 sm:h-44" />

        <span className="absolute top-2.5 left-2.5 rounded-full bg-brand px-2.5 py-1 text-[10px] font-black tracking-[0.08em] text-on-brand">
          LOTIZACIÓN
        </span>

        <span
          className={cn(
            "absolute top-2.5 right-2.5 rounded-full px-2.5 py-1 text-[10px] font-black tracking-[0.08em] uppercase backdrop-blur",
            STATUS_STYLE[project.status],
          )}
        >
          {PROJECT_STATUS_LABELS[project.status]}
        </span>

        {project.images.length > 1 ? (
          <span className="absolute right-2.5 bottom-2.5 rounded-full bg-brand/75 px-2 py-0.5 text-[10px] font-bold text-on-brand backdrop-blur">
            {project.images.length} fotos
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <p className="font-display text-lg leading-none font-black tracking-tight text-brand">
          {formatPrice(project.priceFrom, project.currency)}
        </p>

        <h3 className="mt-2 line-clamp-2 min-h-[2lh] text-sm leading-snug font-bold text-ink">
          {project.name}
        </h3>

        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
          <PinIcon className="size-3.5 shrink-0" />
          <span className="truncate">
            {district}, {project.location.department}
          </span>
        </p>

        {project.description ? (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
            {project.description}
          </p>
        ) : null}

        <DataGrid columns={4} className="mt-3">
          <DataCell label="Área" value={formatArea(project.areaRange.min)} />
          <DataCell label="Lotes" value={project.totalLots ?? project.lotsCount} />
          <DataCell label="Fase" value={PROJECT_STAGE_LABELS[STAGE_LABELS[project.stage]]} />
          <DataCell label="Entrega" value={new Date(project.estimatedDelivery).getFullYear()} />
        </DataGrid>

        <div className="mt-auto flex gap-2 pt-3.5">
          {project.status === "PUBLISHED" ? (
            <Link
              href={ROUTES.project(project.slug)}
              className="flex h-9 flex-1 items-center justify-center rounded-card bg-brand px-2.5 text-xs font-bold text-on-brand transition-colors hover:bg-brand-hover"
            >
              Ver publicación
            </Link>
          ) : (
            <span className="flex h-9 flex-1 items-center justify-center rounded-card bg-surface-muted px-2.5 text-xs font-bold text-muted">
              {project.status === "DRAFT" ? "Borrador" : "No publicado"}
            </span>
          )}
          <Link
            href={ROUTES.panel.owner.base}
            className="flex h-9 items-center justify-center rounded-card border border-edge px-2.5 text-xs font-bold text-brand transition-colors hover:border-brand"
          >
            Panel
          </Link>
        </div>
      </div>
    </article>
  );
}
