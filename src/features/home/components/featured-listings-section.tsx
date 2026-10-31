import Link from "next/link";
import { House } from "lucide-react";
import { ArrowRightIcon } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { FeaturedListingCard } from "@/features/listings";
import { getPublicListingsServer } from "@/features/listings/api/server";
import { FavoriteButton } from "@/features/favorites";

export async function FeaturedListingsSection() {
  const listings = await getPublicListingsServer(5).catch(() => ({
    items: [],
    total: 0,
    page: 1,
    pageSize: 5,
    hasMore: false,
  }));

  return (
    <section className="bg-white px-4 py-10 sm:px-6 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col items-start gap-4 border-b border-edge pb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand/60">Selección para ti</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-brand sm:text-4xl">Propiedades destacadas</h2>
            <p className="mt-2 text-sm text-muted">Espacios con ubicación, valor y potencial.</p>
          </div>

          <Link
            href={ROUTES.properties}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-edge px-4 text-sm font-semibold text-brand transition-colors hover:border-brand hover:bg-brand hover:text-white sm:shrink-0"
          >
            Ver todas las propiedades
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>

        <ul className="horizontal-scrollbar-hidden mt-6 flex w-full snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-3 sm:mt-7 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:pb-0 lg:grid-cols-3 xl:grid-cols-5">
          {listings.items.map((listing) => (
            <li key={listing.id} className="w-[min(84vw,22rem)] shrink-0 snap-start sm:w-auto">
              <FeaturedListingCard
                listing={listing}
                favoriteAction={<FavoriteButton propertyId={listing.id} title={listing.title} />}
              />
            </li>
          ))}
        </ul>

        {listings.items.length > 1 ? (
          <p className="mt-1 text-[11px] text-muted sm:hidden">Desliza para ver más propiedades →</p>
        ) : null}

        {listings.items.length === 0 ? (
          <div role="status" className="mt-7 flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-edge bg-[#f7f6f2] px-6 py-10 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-white text-brand shadow-sm"><House className="size-6" /></span>
            <h3 className="mt-4 font-display text-lg font-bold text-brand">Aún no hay propiedades que mostrar</h3>
            <p className="mt-1 max-w-md text-sm leading-relaxed text-muted">Pronto encontrarás nuevas opciones para comprar o alquilar.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
