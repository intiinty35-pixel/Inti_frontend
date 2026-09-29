import Link from "next/link";
import { ClockIcon, HeartIcon, PinIcon } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { formatArea, formatPrice } from "@/shared/lib/format";
import { formatPublishedDate } from "@/shared/lib/published-date";
import type { Listing } from "@/features/listings/types/listing";
import { DataCell, DataGrid } from "@/features/listings/components/data-grid";
import { ListingImage } from "@/features/listings/components/listing-image";

export function FeaturedListingCard({ listing }: { listing: Listing }) {
  const published = formatPublishedDate(listing.publishedAt);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)]">
      <div className="relative">
        <ListingImage src={listing.images[0]} className="h-40 sm:h-48 xl:h-52" />
        <span className="absolute top-2 left-2 rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold text-on-brand">
          {listing.operation === "rent" ? "ALQUILER" : "VENTA"}
        </span>
        {published?.isNew ? (
          <span className="absolute bottom-2 left-2 rounded-full bg-accent px-2.5 py-1 text-[10px] font-black text-brand">
            NUEVO
          </span>
        ) : null}
        <button
          type="button"
          aria-label="Guardar favorito"
          className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-surface text-brand shadow-[var(--shadow-card)]"
        >
          <HeartIcon className="size-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3.5 xl:p-4">
        <p className="text-base font-bold text-brand">
          {formatPrice(listing.price.amount, listing.price.currency)}
        </p>
        <h3 className="mt-0.5 line-clamp-2 min-h-[2lh] text-xs leading-snug font-semibold text-ink">
          {listing.title}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-muted">
          <PinIcon className="size-3" />
          {listing.location.district}, {listing.location.department}
        </p>
        {published ? (
          <time dateTime={published.iso} className="mt-1 flex items-center gap-1 text-[11px] text-muted">
            <ClockIcon className="size-3" />
            {published.relative}
          </time>
        ) : null}

        <DataGrid columns={4} className="mt-2.5">
          <DataCell label="Área" value={formatArea(listing.areaM2)} />
          <DataCell label="Dorm." value={listing.rooms} />
          <DataCell label="Baños" value={listing.bathrooms} />
          <DataCell label="Estac." value={listing.parkingSpaces} />
        </DataGrid>

        <div className="mt-auto pt-2.5">
          <Link
            href={ROUTES.property(listing.slug)}
            className="flex h-9 w-full items-center justify-center rounded-card bg-brand px-3 text-xs font-bold text-on-brand transition-colors hover:bg-brand-hover"
          >
            Ver propiedad
          </Link>
        </div>
      </div>
    </article>
  );
}
