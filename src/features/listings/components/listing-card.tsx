import type { Listing } from "@/features/listings/types/listing";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <div className="rounded-card border border-edge bg-surface p-4">
      <div className="aspect-[4/3] w-full rounded-card bg-surface-muted" aria-hidden />
      <p className="mt-3 font-semibold text-brand">S/ {listing.price.amount}</p>
      <p className="font-medium text-ink">{listing.title}</p>
      <p className="text-sm text-muted">
        {listing.location.district}, {listing.location.department}
      </p>
    </div>
  );
}