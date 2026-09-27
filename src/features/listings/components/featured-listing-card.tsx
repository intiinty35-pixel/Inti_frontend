import { SoonButton } from "@/shared/ui";
import { formatArea, formatPrice } from "@/shared/lib/format";
import type { Listing } from "@/features/listings/types/listing";
import { DataCell, DataGrid } from "@/features/listings/components/data-grid";
import { ListingImage } from "@/features/listings/components/listing-image";

export function FeaturedListingCard({ listing }: { listing: Listing }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)]">
      <ListingImage src={listing.images[0]} className="h-36 sm:h-44" />

      <div className="flex flex-1 flex-col p-2.5">
        <p className="text-base font-bold text-brand">
          {formatPrice(listing.price.amount, listing.price.currency)}
        </p>
        <h3 className="mt-0.5 line-clamp-2 min-h-[2lh] text-xs leading-snug font-semibold text-ink">
          {listing.title}
        </h3>

        <DataGrid columns={4} className="mt-2">
          <DataCell label="Área" value={formatArea(listing.areaM2)} />
          <DataCell label="Dorm." value={listing.rooms} />
          <DataCell label="Baños" value={listing.bathrooms} />
          <DataCell label="Estac." value={listing.parkingSpaces} />
        </DataGrid>

        <div className="mt-auto pt-2">
          <SoonButton size="xs" className="w-full">
            Ver propiedad
          </SoonButton>
        </div>
      </div>
    </article>
  );
}
