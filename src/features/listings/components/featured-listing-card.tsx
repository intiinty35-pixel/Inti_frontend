import Link from "next/link";
import { ClockIcon, PinIcon } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { formatArea, formatPrice } from "@/shared/lib/format";
import { formatPublishedDate } from "@/shared/lib/published-date";
import type { Listing } from "@/features/listings/types/listing";
import { DataCell, DataGrid } from "@/features/listings/components/data-grid";
import { ListingImage } from "@/features/listings/components/listing-image";
import type { ReactNode } from "react";

export function FeaturedListingCard({
  listing,
  favoriteAction,
}: {
  listing: Listing;
  favoriteAction?: ReactNode;
}) {
  const published = formatPublishedDate(listing.publishedAt);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)] transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]">
      <div className="relative">
        <ListingImage src={listing.images[0]} className="h-28 sm:h-44 xl:h-48" />
        <span className="absolute top-2 left-2 rounded-full bg-accent px-2.5 py-1 text-[10px] font-black text-on-accent">
          {listing.operation === "rent" ? "ALQUILER" : "VENTA"}
        </span>
        {published?.isNew ? (
          <span className="absolute bottom-2 left-2 rounded-full bg-accent px-2.5 py-1 text-[10px] font-black text-brand">
            NUEVO
          </span>
        ) : null}
        {favoriteAction ? (
          <div className="absolute top-2 right-2">{favoriteAction}</div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-2 sm:p-3.5 xl:p-4">
        <p className="text-[13px] font-black text-brand sm:text-base">
          {formatPrice(listing.price.amount, listing.price.currency)}
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-[13px] leading-snug font-bold text-ink sm:min-h-[2lh]">
          {listing.title}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-[10px] text-muted sm:text-[11px]">
          <PinIcon className="size-3" />
          {listing.location.district}, {listing.location.department}
        </p>
        {published ? (
          <time dateTime={published.iso} className="mt-1 flex items-center gap-1 text-[10px] text-muted sm:text-[11px]">
            <ClockIcon className="size-3" />
            {published.relative}
          </time>
        ) : null}

        <DataGrid columns={4} className="mt-1.5 gap-x-1 sm:mt-2.5 sm:gap-x-2">
          <DataCell label="Área" value={formatArea(listing.areaM2)} />
          <DataCell label="Dorm." value={listing.rooms} />
          <DataCell label="Baños" value={listing.bathrooms} />
          <DataCell label="Estac." value={listing.parkingSpaces} />
        </DataGrid>

        <div className="mt-auto pt-2.5">
          <Link
            href={ROUTES.property(listing.slug)}
            className="flex h-8 w-full items-center justify-center rounded bg-accent px-2 text-xs font-black text-on-accent transition-colors hover:bg-accent-hover sm:h-9 sm:px-3 sm:text-xs"
          >
            Ver propiedad
          </Link>
        </div>
      </div>
    </article>
  );
}
