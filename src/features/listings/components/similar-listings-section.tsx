import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { FeaturedListingCard } from "@/features/listings/components/featured-listing-card";
import type { Listing, PropertyDetail } from "@/features/listings/types/listing";
import { rankSimilarListings } from "@/features/listings/lib/similar-listings";

interface SimilarListingsSectionProps {
  property: PropertyDetail;
  /** Pool de candidatos ya descargado; el orden final lo define el algoritmo. */
  candidates: Listing[];
  limit?: number;
  favoriteAction?: (listing: Listing) => ReactNode;
}

/**
 * Bloque de cierre del detalle: propiedades parecidas segun precio, zona y
 * caracteristicas. Se muestra al final del contenido, debajo del anunciante.
 */
export function SimilarListingsSection({
  property,
  candidates,
  limit = 5,
  favoriteAction,
}: SimilarListingsSectionProps) {
  const matches = rankSimilarListings(property, candidates, { limit });

  if (matches.length === 0) {
    return null;
  }

  const zoneLabel = property.location.district || property.location.province || property.location.department;

  return (
    <section className="mt-9">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-black tracking-[0.2em] text-accent uppercase">
            También te puede interesar
          </p>
          <h2 className="mt-1 font-display text-xl font-black tracking-tight text-brand lg:text-2xl">
            {zoneLabel ? `Propiedades similares en ${zoneLabel}` : "Propiedades similares"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Seleccionadas por precio, zona y características parecidas a esta publicación.
          </p>
        </div>
        <Link
          href={`${ROUTES.properties}?operation=${property.operation === "rent" ? "rent" : "buy"}&type=${property.type}&district=${encodeURIComponent(property.location.district)}`}
          className="flex h-10 shrink-0 items-center gap-2 rounded-card border border-edge px-4 text-xs font-bold text-brand transition-colors hover:border-brand"
        >
          Ver más similares
          <ArrowRightIcon className="size-3.5" />
        </Link>
      </div>

      {/* 5 por fila en pantallas amplias. Con pocos resultados el grid no inventa
          columnas vacias: 3 tarjetas ocupan 3 columnas y quedan alineadas a la izquierda. */}
      <ul className="mt-4 grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {matches.map(({ listing }) => (
          <li key={listing.id}>
            <FeaturedListingCard
              listing={listing}
              favoriteAction={favoriteAction?.(listing)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
