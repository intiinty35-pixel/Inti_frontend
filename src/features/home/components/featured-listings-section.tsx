import Link from "next/link";
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
    <section className="bg-[#f1efea] px-3 pt-3 pb-8 sm:px-4 lg:px-5 xl:px-6">
      <div className="mx-auto w-full">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <h2 className="text-[22px] leading-none font-black tracking-tight text-[#082a6b] sm:text-[26px]">
              Propiedades destacadas
            </h2>
            <span aria-hidden className="hidden h-0.5 w-7 rounded-full bg-accent sm:block" />
            <p className="text-[10px] leading-none font-bold text-[#596273] sm:text-[11px]">
              Inmuebles con ubicacion, valor y potencial
            </p>
          </div>

          <Link
            href={ROUTES.properties}
            className="flex shrink-0 items-center gap-2 text-[10px] font-black text-[#082a6b] transition-colors hover:text-brand sm:text-xs"
          >
            Ver todas las propiedades
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>

        <ul className="horizontal-scrollbar-hidden mt-5 flex w-full snap-x snap-mandatory gap-3 overflow-x-auto pb-3 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:pb-0 lg:grid-cols-3 xl:grid-cols-5">
          {listings.items.map((listing) => (
            <li key={listing.id} className="w-[calc((100vw_-_2.25rem)/2)] shrink-0 snap-start sm:w-auto">
              <FeaturedListingCard
                listing={listing}
                favoriteAction={<FavoriteButton propertyId={listing.id} title={listing.title} />}
              />
            </li>
          ))}
        </ul>

        {listings.items.length === 0 ? (
          <div className="mt-5 rounded-card border border-dashed border-edge bg-surface p-8 text-center text-sm text-muted">
            Aun no hay propiedades publicadas.
          </div>
        ) : null}
      </div>
    </section>
  );
}
