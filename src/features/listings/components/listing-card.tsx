import Link from "next/link";
import { ClockIcon, PinIcon, WhatsappIcon } from "@/shared/ui/icons";
import { ROUTES } from "@/shared/config/routes";
import { formatPrice } from "@/shared/lib/format";
import { formatPublishedDate } from "@/shared/lib/published-date";
import type { Listing } from "@/features/listings/types/listing";
import { ListingImage } from "@/features/listings/components/listing-image";
import { ListingSpecs } from "@/features/listings/components/listing-specs";

const OPERATION_LABEL: Record<string, string> = {
  buy: "VENTA",
  rent: "ALQUILER",
  invest: "INVERSIÓN",
};

export function ListingCard({ listing }: { listing: Listing }) {
  const published = formatPublishedDate(listing.publishedAt);
  const isLandListing = listing.type === "land" || listing.type === "country-lots";
  const price = (
    <p className={`text-lg font-bold text-brand ${isLandListing ? "mr-auto" : ""}`}>
      {formatPrice(listing.price.amount, listing.price.currency)}
      {listing.price.period === "mensual" ? (
        <span className="ml-1 text-xs font-semibold text-muted">/ mes</span>
      ) : null}
    </p>
  );

  return (
    <article className="flex flex-col overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)] transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)] md:grid md:grid-cols-[minmax(220px,32%)_1fr] md:items-stretch">
      <div className="relative min-w-0">
        <Link href={ROUTES.property(listing.slug)} aria-label={listing.title} className="block h-full">
          <ListingImage src={listing.images[0]} className="h-48 w-full md:h-full" />
        </Link>
        <span className="absolute top-2.5 left-2.5 rounded-full bg-brand px-2.5 py-1 text-[10px] font-black tracking-[0.08em] text-on-brand">
          {OPERATION_LABEL[listing.operation] ?? "VENTA"}
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

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-4">
        {!isLandListing ? price : null}
        <h3 className={isLandListing ? "text-base font-bold text-ink" : "text-sm font-semibold text-ink"}>
          {listing.title}
        </h3>
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <PinIcon className="size-3.5 shrink-0" />
          {listing.location.district}, {listing.location.department}
        </p>
        {published ? (
          <time dateTime={published.iso} className="flex items-center gap-1.5 text-xs text-muted">
            <ClockIcon className="size-3.5 shrink-0" />
            {published.relative}
          </time>
        ) : null}
        {listing.description ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted">{listing.description}</p>
        ) : null}
        <ListingSpecs listing={listing} className="mt-2" />
        <div className={`mt-auto flex flex-wrap gap-2 pt-4 ${isLandListing ? "items-center justify-between" : "justify-end"}`}>
          {isLandListing ? price : null}
          <div className="flex flex-wrap justify-end gap-2">
            <Link
              href={ROUTES.property(listing.slug)}
              className="flex h-10 items-center justify-center rounded-card bg-brand px-4 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
            >
              Ver propiedad
            </Link>
            <Link
              href={`${ROUTES.property(listing.slug)}#contacto`}
              className="flex h-10 items-center justify-center gap-2 rounded-card bg-[#25d366] px-4 text-sm font-bold text-white transition-colors hover:bg-[#1fb857]"
            >
              <WhatsappIcon className="size-4" />
              Contactar
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
