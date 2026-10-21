"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { PinIcon } from "@/shared/ui";
import { ClockIcon } from "@/shared/ui/icons";
import { cn } from "@/shared/lib/cn";
import { ROUTES } from "@/shared/config/routes";
import { formatArea, formatPrice } from "@/shared/lib/format";
import { formatPublishedDate } from "@/shared/lib/published-date";
import {
  PROJECT_STATUS_LABELS,
  type ApiProjectStatus,
  type ProjectApiSummary,
} from "@/features/projects/types/api";
import { deleteAdminProject, deleteProject, publishAdminProject, publishProject } from "@/features/projects/api";
import { PROJECT_STAGE_LABELS } from "@/features/projects/data/project-catalogs";
import type { ProjectStage } from "@/features/projects/types/draft";
import { DataCell, DataGrid } from "@/features/listings/components/data-grid";
import { ListingImage } from "@/features/listings/components/listing-image";
import { ProjectTourVideo } from "@/features/listings/components/project-tour-video";
import { ProjectLocationModal } from "@/features/projects/components/project-location-modal";
import { ReviewPublishModal } from "@/shared/ui/review-publish-modal";

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

export function OwnerProjectCard({
  project,
  adminMode = false,
  isAgency = false,
  agencyName,
}: {
  project: ProjectApiSummary;
  adminMode?: boolean;
  isAgency?: boolean;
  agencyName?: string;
}) {
  const router = useRouter();
  const district = project.location.district;
  const [status, setStatus] = useState(project.status);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationSaving, setLocationSaving] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const portalTarget = typeof document === "undefined" ? null : document.body;
  const published = formatPublishedDate(project.publishedAt);

  async function handlePublish() {
    setPublishing(true);
    setError(null);
    try {
      const published = await (adminMode ? publishAdminProject(project.id) : publishProject(project.id));
      setStatus(published.status);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo publicar el proyecto.");
    } finally {
      setPublishing(false);
    }
  }

  async function handleReviewSubmit() {
    const published = await publishProject(project.id);
    setStatus(published.status);
    router.refresh();
  }

  async function handleDelete() {
    if (!window.confirm(`¿Eliminar el proyecto "${project.name}"?`)) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);
    try {
      if (adminMode) {
        await deleteAdminProject(project.id);
      } else {
        await deleteProject(project.id);
      }
      router.refresh();
    } catch (cause) {
      setDeleteError(cause instanceof Error ? cause.message : "No se pudo eliminar el proyecto.");
      setDeleting(false);
    }
  }

  const needsSubscription =
    !adminMode &&
    error !== null &&
    (error.toLowerCase().includes("suscrip") ||
      error.toLowerCase().includes("crédito") ||
      error.toLowerCase().includes("credito"));

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
            STATUS_STYLE[status],
          )}
        >
          {PROJECT_STATUS_LABELS[status]}
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
        {published ? (
          <time dateTime={published.iso} className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
            <ClockIcon className="size-3.5 shrink-0" />
            <span>
              Fecha de publicación: <span className="font-semibold">{published.full}</span>
            </span>
          </time>
        ) : null}

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

        <div className="mt-auto flex flex-wrap gap-2 pt-3.5">
          {status === "PUBLISHED" ? (
            <Link
              href={ROUTES.project(project.slug)}
              className="flex h-9 min-w-0 flex-[1_1_140px] items-center justify-center rounded-card bg-brand px-2.5 text-center text-xs font-bold text-on-brand transition-colors hover:bg-brand-hover"
            >
              Ver publicación
            </Link>
          ) : status === "DRAFT" && isAgency && !adminMode ? (
            <button type="button" onClick={() => setReviewOpen(true)} className="flex h-9 min-w-0 flex-[1_1_140px] items-center justify-center rounded-card bg-brand px-2.5 text-center text-xs font-bold text-on-brand transition-colors hover:bg-brand-hover">
              Publicar
            </button>
          ) : status === "DRAFT" ? (
            <button
              type="button"
              onClick={() => void handlePublish()}
              disabled={publishing}
              className="flex h-9 min-w-0 flex-[1_1_140px] items-center justify-center rounded-card bg-brand px-2.5 text-center text-xs font-bold text-on-brand transition-colors hover:bg-brand-hover disabled:cursor-wait disabled:opacity-60"
            >
              {publishing ? "Publicando…" : "Publicar"}
            </button>
          ) : (
            <span className="flex h-9 min-w-0 flex-[1_1_140px] items-center justify-center rounded-card bg-surface-muted px-2.5 text-center text-xs font-bold text-muted">
              En revisión
            </span>
          )}
          {project.tourUrl ? (
            <ProjectTourVideo projectName={project.name} url={project.tourUrl} className="size-9 shrink-0" />
          ) : null}
          <button
            type="button"
            onClick={() => {
              setLocationError(null);
              setLocationOpen(true);
            }}
            className="flex h-9 min-w-[92px] flex-1 items-center justify-center rounded-card border border-edge px-2.5 text-center text-xs font-bold text-brand transition-colors hover:border-brand"
          >
            Ubicación
          </button>
          <Link
            href={adminMode ? ROUTES.panel.admin.editProject(project.id) : ROUTES.panel.owner.editProject(project.id)}
            className="flex h-9 min-w-[78px] flex-1 items-center justify-center rounded-card border border-brand px-2.5 text-center text-xs font-bold text-brand transition-colors hover:bg-brand hover:text-on-brand"
          >
            Editar
          </Link>
          {adminMode && <Link href={`/panel/admin/projects/${project.id}/site-plan`} className="rounded-card border border-edge px-3 py-2 text-xs font-bold text-brand">Plano y lotes</Link>}
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={deleting}
            className="flex h-9 min-w-[82px] flex-1 items-center justify-center rounded-card border border-error/30 px-2.5 text-center text-xs font-bold text-error transition-colors hover:border-error hover:bg-error/10 disabled:cursor-wait disabled:opacity-60"
          >
            {deleting ? "Eliminando..." : "Eliminar"}
          </button>
          {adminMode ? (
            <Link
              href={ROUTES.panel.admin.projects}
              className="flex h-9 min-w-[72px] flex-1 items-center justify-center rounded-card border border-edge px-2.5 text-center text-xs font-bold text-brand transition-colors hover:border-brand"
            >
              Panel
            </Link>
          ) : null}
        </div>
        {deleteError ? (
          <p className="mt-2 rounded-card bg-error/10 px-3 py-2 text-xs font-semibold text-error">
            {deleteError}
          </p>
        ) : null}
      </div>

      {error && portalTarget
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-brand/45 p-4 backdrop-blur-sm"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setError(null);
              }}
            >
              <section
                className="w-full max-w-md rounded-card border border-edge bg-surface p-6 shadow-[var(--shadow-pop)]"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={`publish-error-title-${project.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2
                      id={`publish-error-title-${project.id}`}
                      className="font-display text-xl font-black text-brand"
                    >
                      {needsSubscription ? "No se pudo publicar" : "Error al publicar el proyecto"}
                    </h2>
                    <p className="mt-2 text-sm text-muted">{error}</p>
                    {needsSubscription ? (
                      <Link
                        href={ROUTES.panel.owner.subscription}
                        className="mt-5 inline-flex rounded-card bg-brand px-4 py-2.5 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
                      >
                        Consultar suscripción
                      </Link>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    aria-label="Cerrar mensaje"
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-muted hover:text-brand"
                  >
                    ×
                  </button>
                </div>
              </section>
            </div>,
            portalTarget,
          )
        : null}
      {portalTarget ? (
        <ReviewPublishModal
          agencyName={agencyName}
          itemName={project.name}
          itemType="proyecto"
          open={reviewOpen}
          onClose={() => setReviewOpen(false)}
          onSubmit={handleReviewSubmit}
        />
      ) : null}
      {locationOpen && portalTarget
        ? createPortal(
            <ProjectLocationModal
              project={project}
              adminMode={adminMode}
              saving={locationSaving}
              error={locationError}
              onClose={() => setLocationOpen(false)}
              onSavingChange={setLocationSaving}
              onError={setLocationError}
              onSaved={() => {
                setLocationOpen(false);
                router.refresh();
              }}
            />,
            portalTarget,
          )
        : null}
    </article>
  );
}
