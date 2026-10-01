import Link from "next/link";
import { ClockIcon, PinIcon } from "@/shared/ui";
import { formatArea, formatPrice } from "@/shared/lib/format";
import { formatPublishedDate } from "@/shared/lib/published-date";
import { ROUTES } from "@/shared/config/routes";
import type { Project, ProjectStatus } from "@/features/listings/types/project";
import { DataCell, DataGrid } from "@/features/listings/components/data-grid";
import { ListingImage } from "@/features/listings/components/listing-image";
import { ProjectTourVideo } from "@/features/listings/components/project-tour-video";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  preventa: "En preventa",
  "en-construccion": "En construcción",
  entregado: "Entregado",
};

export function ProjectCard({ project }: { project: Project }) {
  const published = formatPublishedDate(project.publishedAt);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)]">
      <div className="relative">
        <ListingImage src={project.images[0]} className="h-40 sm:h-48 xl:h-52">
          <span className="absolute top-2 left-2 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold text-on-accent">
            {STATUS_LABELS[project.status]}
          </span>
          {published?.isNew ? (
            <span className="absolute top-2 right-2 rounded-full bg-accent px-2.5 py-1 text-[10px] font-black text-brand">
              NUEVO
            </span>
          ) : null}
        </ListingImage>
        {project.tourUrl ? (
          <ProjectTourVideo
            projectName={project.name}
            url={project.tourUrl}
            className="absolute right-2 bottom-2"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-3.5 xl:p-4">
        <p className="text-[9px] font-bold tracking-[0.16em] text-accent uppercase">
          {project.developer}
        </p>
        <h3 className="mt-0.5 text-[13px] leading-snug font-bold text-brand">{project.name}</h3>
        <p className="mt-1 text-[15px] font-bold text-brand">
          Desde {formatPrice(project.startingPrice.amount, project.startingPrice.currency)}
        </p>
        {published ? (
          <time dateTime={published.iso} className="mt-1 flex items-center gap-1 text-[11px] text-muted">
            <ClockIcon className="size-3" />
            {published.relative}
          </time>
        ) : null}

        <DataGrid columns={4} className="mt-2.5">
          <DataCell label="Área" value={formatArea(project.areaRange.min)} />
          <DataCell label={project.lotsLabel ?? "lotes"} value={project.lotsTotal} />
          <DataCell label="Entrega" value={project.deliveryStage} />
          <DataCell label="Distrito" value={project.location.district} />
        </DataGrid>

        <div className="mt-auto flex pt-2.5">
          <Link
            href={ROUTES.project(project.slug)}
            className="inline-flex h-9 w-full items-center justify-center gap-1 rounded-card bg-brand px-2.5 text-xs font-medium text-on-brand transition-colors hover:bg-brand-hover"
          >
            Ver proyecto
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ProjectListingCard({ project }: { project: Project }) {
  const published = formatPublishedDate(project.publishedAt);

  return (
    <article className="flex flex-col overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)] transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)] md:grid md:grid-cols-[minmax(220px,32%)_1fr] md:items-stretch">
      <div className="relative min-w-0">
        <Link href={ROUTES.project(project.slug)} aria-label={project.name} className="block h-full">
          <ListingImage src={project.images[0]} className="h-48 w-full md:h-full" />
        </Link>
        <span className="absolute top-2.5 left-2.5 rounded-full bg-brand px-2.5 py-1 text-[10px] font-black tracking-[0.08em] text-on-brand">
          {STATUS_LABELS[project.status]}
        </span>
        {project.images.length > 1 ? (
          <span className="absolute right-2.5 bottom-2.5 rounded-full bg-brand/75 px-2 py-0.5 text-[10px] font-bold text-on-brand backdrop-blur">
            {project.images.length} fotos
          </span>
        ) : null}
        {published?.isNew ? (
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-accent px-2.5 py-1 text-[10px] font-black tracking-[0.08em] text-brand">
            NUEVO
          </span>
        ) : null}
        {project.tourUrl ? (
          <ProjectTourVideo
            projectName={project.name}
            url={project.tourUrl}
            className="absolute top-2 right-2 z-10"
          />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-4">
        <h3 className="text-base font-bold text-ink">{project.name}</h3>
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <PinIcon className="size-3.5 shrink-0" />
          {project.location.district}, {project.location.department}
        </p>
        {published ? (
          <time dateTime={published.iso} className="flex items-center gap-1.5 text-xs text-muted">
            <ClockIcon className="size-3.5 shrink-0" />
            {published.relative}
          </time>
        ) : null}
        {project.description ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted">{project.description}</p>
        ) : null}

        <DataGrid columns={4} className="mt-2">
          <DataCell label="Área" value={formatArea(project.areaRange.min)} />
          <DataCell label={project.lotsLabel ?? "lotes"} value={project.lotsTotal} />
          <DataCell label="Entrega" value={project.deliveryStage} />
          <DataCell label="Distrito" value={project.location.district} />
        </DataGrid>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
          <p className="mr-auto text-base font-bold text-brand">
            Desde {formatPrice(project.startingPrice.amount, project.startingPrice.currency)}
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <Link
              href={ROUTES.project(project.slug)}
              className="flex h-10 items-center justify-center rounded-card bg-brand px-4 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
            >
              Ver proyecto
            </Link>
            <Link
              href={`${ROUTES.project(project.slug)}#contacto`}
              className="flex h-10 items-center justify-center rounded-card border border-edge px-4 text-sm font-bold text-brand transition-colors hover:border-brand"
            >
              Contactar
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
