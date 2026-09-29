import Link from "next/link";
import { ClockIcon, PinIcon } from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import { ROUTES } from "@/shared/config/routes";
import { formatArea, formatPrice } from "@/shared/lib/format";
import { formatPublishedDate } from "@/shared/lib/published-date";
import type { Listing } from "@/features/listings/types/listing";
import { DataCell, DataGrid } from "@/features/listings/components/data-grid";
import { ListingImage } from "@/features/listings/components/listing-image";

const STATUS_LABEL: Record<string, string> = {
  disponible: "Publicado",
  reservado: "Pausado",
  vendido: "Vendido",
  alquilado: "Alquilado",
};

const STATUS_STYLE: Record<string, string> = {
  disponible: "bg-success/12 text-success",
  reservado: "bg-warning/15 text-warning",
  vendido: "bg-brand-soft text-brand",
  alquilado: "bg-brand-soft text-brand",
};

const OPERATION_LABEL: Record<string, string> = {
  buy: "VENTA",
  rent: "ALQUILER",
  invest: "INVERSIÓN",
};

export function OwnerListingCard({ listing }: { listing: Listing }) {
  const status = listing.status ?? "disponible";
  const published = formatPublishedDate(listing.publishedAt);

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
            STATUS_STYLE[status] ?? "bg-surface/90 text-muted",
          )}
        >
          {STATUS_LABEL[status] ?? status}
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
              Fecha de publicación: <span className="font-semibold">{published.full}</span>
            </span>
          </time>
        ) : null}

        {listing.description ? (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
            {listing.description}
          </p>
        ) : null}

        <DataGrid columns={4} className="mt-3">
          <DataCell label="Área" value={formatArea(listing.areaM2)} />
          <DataCell label="Dorm." value={listing.rooms} />
          <DataCell label="Baños" value={listing.bathrooms} />
          <DataCell label="Estac." value={listing.parkingSpaces} />
        </DataGrid>

        <div className="mt-auto flex gap-2 pt-3.5">
          <Link
            href={ROUTES.property(listing.slug)}
            className="flex h-9 flex-1 items-center justify-center rounded-card bg-brand px-2.5 text-xs font-bold text-on-brand transition-colors hover:bg-brand-hover"
          >
            Ver publicación
          </Link>
          <Link
            href={`${ROUTES.panel.owner.base}?listing=${listing.id}`}
            className="flex h-9 items-center justify-center rounded-card border border-edge px-2.5 text-xs font-bold text-brand transition-colors hover:border-brand"
          >
            Rendimiento
          </Link>
        </div>
      </div>
    </article>
  );
}
