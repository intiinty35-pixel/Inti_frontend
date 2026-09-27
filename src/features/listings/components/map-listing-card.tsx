import { PinIcon } from "@/shared/ui/icons";
import { formatPrice } from "@/shared/lib/format";
import type { Listing } from "@/features/listings/types/listing";
import { ListingImage } from "@/features/listings/components/listing-image";
import { ListingSpecs } from "@/features/listings/components/listing-specs";

/** Card horizontal para el listado scrollable de la sección de mapa. */
export function MapListingCard({ listing }: { listing: Listing }) {
  return (
    <article className="flex snap-start gap-3 rounded-card border border-edge bg-surface p-3 shadow-[var(--shadow-card)]">
      <ListingImage
        src={listing.images[0]}
        className="aspect-[4/3] w-28 shrink-0 rounded-lg sm:w-32"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-1 py-0.5">
        <p className="text-sm font-bold text-brand">
          {formatPrice(listing.price.amount, listing.price.currency)}
        </p>
        <h3 className="line-clamp-2 text-xs leading-snug font-semibold text-ink">
          {listing.title}
        </h3>
        <p className="flex items-center gap-1.5 truncate text-[11px] text-muted">
          <PinIcon className="size-3 shrink-0" />
          {listing.location.district}, {listing.location.department}
        </p>
        <ListingSpecs listing={listing} className="mt-auto pt-1.5" />
      </div>
    </article>
  );
}
