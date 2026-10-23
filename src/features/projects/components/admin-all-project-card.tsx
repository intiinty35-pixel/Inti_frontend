import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import { ROUTES } from "@/shared/config/routes";
import { formatNumber, formatPrice } from "@/shared/lib/format";
import { formatPublishedDate } from "@/shared/lib/published-date";
import { PinIcon, BuildingIcon, MapIcon } from "@/shared/ui/icons";
import { KeyRound } from "lucide-react";
import { ListingImage } from "@/features/listings/components/listing-image";
import {
  PROJECT_STATUS_LABELS,
  type ProjectApiSummary,
} from "@/features/projects/types/api";
import {
  PROJECT_STATUS_STYLE,
  projectOriginLabel,
  projectStageLabel,
} from "@/features/projects/lib/project-labels";

function buildLocationLabel(project: ProjectApiSummary): string {
  const { district, province, department } = project.location;
  return [district, province, department].filter(Boolean).join(", ");
}

function buildAreaLabel(project: ProjectApiSummary): string {
  const { min, max } = project.areaRange;
  if (max <= 0) return "";
  if (min === max) return `${formatNumber(min)} m²`;
  return `${formatNumber(min)}–${formatNumber(max)} m²`;
}

/**
 * Card del portafolio del administrador: la foto grande manda y las acciones son
 * las de gobierno del proyecto (plano, lotes y edicion), no las de publicacion.
 *
 * Es un Server Component a proposito: la pantalla lista hasta 12 proyectos y
 * ninguno necesita estado en el navegador.
 */
export function AdminAllProjectCard({ project }: { project: ProjectApiSummary }) {
  const cover = project.coverImage ?? project.images[0];
  const published = formatPublishedDate(project.publishedAt);
  const location = buildLocationLabel(project);
  const isAriz = project.origin === "ADMIN";
  const isPublished = project.status === "PUBLISHED";
  const area = buildAreaLabel(project);
  const lots = project.totalLots ?? project.lotsCount;
  const deliveryYear = project.estimatedDelivery
    ? new Date(project.estimatedDelivery).getFullYear()
    : null;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)] transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-[var(--shadow-pop)]">
      <div className="relative">
        <ListingImage src={cover} className="aspect-[16/10] w-full" />

        <span
          className={cn(
            "absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-black tracking-[0.08em] uppercase backdrop-blur",
            isAriz ? "bg-accent text-on-accent" : "bg-brand text-on-brand",
          )}
        >
          {projectOriginLabel(project)}
        </span>

        <span
          className={cn(
            "absolute top-3 right-3 rounded-full px-2.5 py-1 text-[10px] font-black tracking-[0.08em] uppercase backdrop-blur",
            PROJECT_STATUS_STYLE[project.status],
          )}
        >
          {PROJECT_STATUS_LABELS[project.status]}
        </span>

        {project.images.length > 1 ? (
          <span className="absolute right-3 bottom-3 rounded-full bg-brand/75 px-2 py-0.5 text-[10px] font-bold text-on-brand backdrop-blur">
            {project.images.length} fotos
          </span>
        ) : null}
        {published?.isNew ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-accent px-2.5 py-1 text-[10px] font-black tracking-[0.08em] text-on-accent">
            NUEVO
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 flex-1 font-display text-lg leading-tight font-black tracking-tight text-brand">
            {project.name}
          </h3>
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Desde</p>
            <p className="mt-0.5 font-display text-xl leading-none font-black tracking-tight text-brand">
              {formatPrice(project.priceFrom, project.currency)}
            </p>
          </div>
        </div>

        {location ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
            <PinIcon className="size-3.5 shrink-0" />
            <span className="truncate">{location}</span>
          </p>
        ) : null}

        {project.developer ? (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
            <BuildingIcon className="size-3.5 shrink-0" />
            <span className="truncate">{project.developer}</span>
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px] font-semibold text-muted">
          {area ? <span className="font-black text-brand">{area}</span> : null}
          {lots ? <span>{lots} lotes</span> : null}
          <span className="rounded-full bg-accent/15 px-2 py-0.5 font-black text-brand">
            {projectStageLabel(project.stage)}
          </span>
          {deliveryYear ? <span>Entrega {deliveryYear}</span> : null}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
          <Link
            href={`${ROUTES.panel.admin.projectAccessCodes}?project=${encodeURIComponent(project.id)}`}
            className="col-span-2 flex h-10 items-center justify-center gap-2 rounded-card border border-brand px-3 text-center text-xs font-bold text-brand transition-colors hover:bg-brand hover:text-on-brand"
          >
            <KeyRound className="size-3.5" aria-hidden="true" />
            Administrar código de acceso
          </Link>
          <Link
            href={`/panel/admin/projects/${project.id}/site-plan`}
            className="col-span-2 flex h-10 items-center justify-center rounded-card bg-accent px-3 text-center text-xs font-black text-on-accent transition-colors hover:bg-accent-hover"
          >
            Editar plano y lotes
          </Link>
          <Link
            href={ROUTES.panel.admin.editProject(project.id)}
            className={`flex h-10 items-center justify-center rounded-card border border-brand px-3 text-center text-xs font-bold text-brand transition-colors hover:bg-brand hover:text-on-brand ${
              isPublished ? "" : "col-span-2"
            }`}
          >
            Editar proyecto
          </Link>
          {isPublished ? (
            <Link
              href={ROUTES.mapProject(project.slug)}
              className="flex h-10 items-center justify-center gap-1.5 rounded-card bg-green-500 px-3 text-center text-xs font-black text-brand transition-colors hover:bg-green-600"
            >
              <MapIcon className="size-3.5 shrink-0" aria-hidden="true" />
              Ver en Mapa
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
