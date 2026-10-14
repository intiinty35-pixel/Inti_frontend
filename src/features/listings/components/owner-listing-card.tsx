"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClockIcon, PinIcon } from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import { ROUTES } from "@/shared/config/routes";
import { formatArea, formatPrice } from "@/shared/lib/format";
import { formatPublishedDate } from "@/shared/lib/published-date";
import { deleteProperty, publishProperty } from "@/features/listings/api";
import { PROPERTY_STATUS_LABELS, type Listing, type PropertyReviewStatus } from "@/features/listings/types/listing";
import { DataCell, DataGrid } from "@/features/listings/components/data-grid";
import { ListingImage } from "@/features/listings/components/listing-image";
import { ReviewPublishModal } from "@/shared/ui/review-publish-modal";

const STATUS_LABEL: Record<string, string> = {
  disponible: "Publicado",
  reservado: "Pausado",
  vendido: "Vendido",
  alquilado: "Alquilado",
  ...PROPERTY_STATUS_LABELS,
};

const STATUS_STYLE: Record<string, string> = {
  disponible: "bg-success/12 text-success",
  reservado: "bg-warning/15 text-warning",
  vendido: "bg-brand-soft text-brand",
  alquilado: "bg-brand-soft text-brand",
  DRAFT: "bg-surface/90 text-muted",
  PENDING_REVIEW: "bg-warning/15 text-warning",
  REJECTED: "bg-error/12 text-error",
};

const OPERATION_LABEL: Record<string, string> = {
  buy: "VENTA",
  rent: "ALQUILER",
  invest: "INVERSION",
};

export function OwnerListingCard({
  listing,
  isAgency = false,
  agencyName,
  showMetrics = true,
  editHref,
}: {
  listing: Listing;
  isAgency?: boolean;
  agencyName?: string;
  showMetrics?: boolean;
  /** Destino del boton "Editar"; por defecto depende del panel (profesional o cliente). */
  editHref?: string;
}) {
  const router = useRouter();
  const status = listing.status ?? "disponible";
  const [reviewOpen, setReviewOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const published = formatPublishedDate(listing.publishedAt);

  async function handleDelete() {
    if (!window.confirm(`¿Eliminar la propiedad "${listing.title}"? Esta accion retirara la publicacion del panel y del sitio.`)) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteProperty(listing.id);
      router.refresh();
    } catch (cause) {
      setDeleteError(cause instanceof Error ? cause.message : "No se pudo eliminar la propiedad.");
      setDeleting(false);
    }
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)] transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]">
      <div className="relative">
        <Link href={ROUTES.property(listing.slug)} aria-label={listing.title}>
          <ListingImage src={listing.images[0]} className="h-40 sm:h-44" />
        </Link>

        <span className="absolute top-2.5 left-2.5 rounded-full bg-brand px-2.5 py-1 text-[10px] font-black tracking-[0.08em] text-on-brand">
          {OPERATION_LABEL[listing.operation] ?? "VENTA"}
        </span>

        <span
          className={cn(
            "absolute top-2.5 right-2.5 rounded-full px-2.5 py-1 text-[10px] font-black tracking-[0.08em] uppercase backdrop-blur",
            STATUS_STYLE[currentStatus] ?? "bg-surface/90 text-muted",
          )}
        >
          {STATUS_LABEL[currentStatus] ?? currentStatus}
        </span>

        {listing.images.length > 1 ? (
          <span className="absolute right-2.5 bottom-2.5 rounded-full bg-brand/75 px-2 py-0.5 text-[10px] font-bold text-on-brand backdrop-blur">
            {listing.images.length} fotos
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
          {formatPrice(listing.price.amount, listing.price.currency)}
          {listing.price.period === "mensual" ? (
            <span className="ml-1 text-xs font-semibold text-muted">/ mes</span>
          ) : null}
        </p>

        <h3 className="mt-2 line-clamp-2 min-h-[2lh] text-sm leading-snug font-bold text-ink">
          {listing.title}
        </h3>

        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
          <PinIcon className="size-3.5 shrink-0" />
          <span className="truncate">
            {listing.location.district}, {listing.location.department}
          </span>
        </p>
        {published ? (
          <time dateTime={published.iso} className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
            <ClockIcon className="size-3.5 shrink-0" />
            <span>
              Fecha de publicacion: <span className="font-semibold">{published.full}</span>
            </span>
          </time>
        ) : null}

        {listing.description ? (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
            {listing.description}
          </p>
        ) : null}

        <DataGrid columns={4} className="mt-3">
          <DataCell label="Area" value={formatArea(listing.areaM2)} />
          <DataCell label="Dorm." value={listing.rooms} />
          <DataCell label="Banos" value={listing.bathrooms} />
          <DataCell label="Estac." value={listing.parkingSpaces} />
        </DataGrid>

        <div className="mt-auto flex flex-wrap gap-2 pt-3.5">
          {isAgency && currentStatus === "DRAFT" ? (
            <button
              type="button"
              onClick={() => setReviewOpen(true)}
              className="flex h-9 min-w-[112px] flex-1 items-center justify-center rounded-card bg-brand px-2.5 text-center text-xs font-bold text-on-brand transition-colors hover:bg-brand-hover"
            >
              Publicar
            </button>
          ) : currentStatus === "PENDING_REVIEW" ? (
            <span className="flex h-9 min-w-[112px] flex-1 items-center justify-center rounded-card bg-surface-muted px-2.5 text-center text-xs font-bold text-muted">
              En revision
            </span>
          ) : (
            <Link
              href={ROUTES.property(listing.slug)}
              className="flex h-9 min-w-[112px] flex-1 items-center justify-center rounded-card bg-brand px-2.5 text-center text-xs font-bold text-on-brand transition-colors hover:bg-brand-hover"
            >
              Ver publicacion
            </Link>
          )}
          <Link
            href={
              editHref ??
              (showMetrics
                ? ROUTES.panel.owner.editListing(listing.id)
                : ROUTES.panel.client.editProperty(listing.id))
            }
            className="flex h-9 min-w-[76px] flex-1 items-center justify-center rounded-card border border-brand px-2.5 text-center text-xs font-bold text-brand transition-colors hover:bg-brand hover:text-on-brand"
          >
            Editar
          </Link>
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={deleting}
            className="flex h-9 min-w-[82px] flex-1 items-center justify-center rounded-card border border-error/30 px-2.5 text-center text-xs font-bold text-error transition-colors hover:border-error hover:bg-error/10 disabled:cursor-wait disabled:opacity-60"
          >
            {deleting ? "Eliminando..." : "Eliminar"}
          </button>
          {showMetrics ? (
            <Link
              href={`${ROUTES.panel.owner.base}?listing=${listing.id}`}
              className="flex h-9 min-w-[104px] flex-1 items-center justify-center rounded-card border border-edge px-2.5 text-center text-xs font-bold text-brand transition-colors hover:border-brand"
            >
              Rendimiento
            </Link>
          ) : null}
        </div>
        {deleteError ? (
          <p className="mt-2 rounded-card bg-error/10 px-3 py-2 text-xs font-semibold text-error">
            {deleteError}
          </p>
        ) : null}
      </div>

      <ReviewPublishModal
        agencyName={agencyName}
        itemName={listing.title}
        itemType="propiedad"
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onSubmit={async () => {
          const result = await publishProperty(listing.id);
          setCurrentStatus(result.status as PropertyReviewStatus);
        }}
      />
    </article>
  );
}
