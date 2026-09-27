import { PinIcon } from "@/shared/ui/icons";
import { formatPrice } from "@/shared/lib/format";
import type { Listing } from "@/features/listings/types/listing";
import { ListingImage } from "@/features/listings/components/listing-image";
import { ListingSpecs } from "@/features/listings/components/listing-specs";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)]">
      <ListingImage src={listing.images[0]} className="aspect-[4/3]" />

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-lg font-bold text-brand">
          {formatPrice(listing.price.amount, listing.price.currency)}
        </p>
        <h3 className="text-sm font-semibold text-ink">{listing.title}</h3>
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <PinIcon className="size-3.5 shrink-0" />
          {listing.location.district}, {listing.location.department}
        </p>
        <ListingSpecs listing={listing} className="mt-2" />
      </div>
    </article>
  );
}
