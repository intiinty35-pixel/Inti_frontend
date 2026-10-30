import Link from "next/link";
import { PinIcon } from "@/shared/ui/icons";
import { ROUTES } from "@/shared/config/routes";
import { formatPrice } from "@/shared/lib/format";
import type { Listing } from "@/features/listings/types/listing";
import { ListingImage } from "@/features/listings/components/listing-image";

/* Lectura defensiva: no conozco todos los campos de `Listing`, asi que se
   normalizan aqui. Cuando confirmes los nombres reales puedes simplificar. */
export interface ListingMeta {
  rooms?: number;
  bathrooms?: number;
  parking?: number;
  area?: number;
  description?: string;
  maintenanceFee?: number;
  operation?: string;
  type?: string;
  period?: string;
}

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

export function getListingMeta(listing: Listing): ListingMeta {
  const l = listing as unknown as Record<string, unknown>;
  const details = (l.details ?? {}) as Record<string, unknown>;
  const price = (l.price ?? {}) as Record<string, unknown>;
  return {
    rooms: num(l.rooms ?? l.bedrooms),
    bathrooms: num(l.bathrooms),
    parking: num(l.parkingSpaces ?? l.parking),
    area: num(details.totalArea ?? l.totalArea ?? l.areaM2 ?? l.area),
    description: typeof l.description === "string" ? l.description : undefined,
    maintenanceFee: num(l.maintenanceFee),
    operation: typeof l.operation === "string" ? l.operation : undefined,
    type: typeof l.type === "string" ? l.type : undefined,
    period: typeof price.period === "string" ? price.period : undefined,
  };
}

interface AgentListingRowProps {
  listing: Listing;
  whatsappDigits?: string;
}

export function AgentListingRow({ listing, whatsappDigits }: AgentListingRowProps) {
  const meta = getListingMeta(listing);

  const specs = [
    meta.area ? `${meta.area} m² tot.` : null,
    meta.rooms ? `${meta.rooms} dorm.` : null,
    meta.bathrooms ? `${meta.bathrooms} ${meta.bathrooms === 1 ? "baño" : "baños"}` : null,
    meta.parking ? `${meta.parking} estac.` : null,
  ].filter(Boolean) as string[];

  const locationLine = [listing.location.district, listing.location.department].filter(Boolean).join(", ");
  const href = ROUTES.property(listing.slug);
  const whatsappUrl = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`Hola, vi "${listing.title}" en INTI y quisiera más información.`)}`
    : undefined;

  return (
    <article className="flex flex-col overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)] transition-colors hover:border-brand/40 md:flex-row">
      <Link href={href} className="block shrink-0 md:w-[340px] lg:w-[380px]" aria-label={listing.title}>
        <ListingImage src={listing.images[0]} className="aspect-[4/3] md:aspect-auto md:h-full md:min-h-[230px]" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="font-display text-xl font-black tracking-tight text-brand">
            {formatPrice(listing.price.amount, listing.price.currency)}
            {meta.period === "mensual" ? <span className="ml-1 text-xs font-semibold text-muted">/ mes</span> : null}
          </p>
          {meta.maintenanceFee ? (
            <p className="text-xs font-semibold text-muted">
              {formatPrice(meta.maintenanceFee, listing.price.currency)} mantenimiento
            </p>
          ) : null}
        </div>

        {specs.length > 0 ? (
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold text-ink">
            {specs.map((spec) => (
              <span key={spec}>{spec}</span>
            ))}
          </p>
        ) : null}

        <h3 className="mt-3 text-sm font-bold text-ink sm:text-base">
          <Link href={href} className="hover:text-brand">
            {listing.title}
          </Link>
        </h3>

        {locationLine ? (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <PinIcon className="size-3.5 shrink-0" />
            <span className="line-clamp-1">{locationLine}</span>
          </p>
        ) : null}

        {meta.description ? (
          <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted">{meta.description}</p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center justify-end gap-2 border-t border-edge pt-4 max-md:mt-4">
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex h-10 items-center justify-center rounded-card bg-[#25d366] px-4 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              WhatsApp
            </a>
          ) : null}
          <Link
            href={href}
            className="flex h-10 items-center justify-center rounded-card border border-edge px-4 text-sm font-bold text-brand transition-colors hover:border-brand"
          >
            Ver propiedad
          </Link>
          <Link
            href={href}
            className="flex h-10 items-center justify-center rounded-card bg-brand px-4 text-sm font-bold text-on-brand"
          >
            Contactar
          </Link>
        </div>
      </div>
    </article>
  );
}