import Link from "next/link";
import { ArrowRightIcon } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { FeaturedListingCard } from "@/features/listings";
import { getPublicListingsServer } from "@/features/listings/api/server";
import { HomeSection, SectionHeading } from "@/features/home/components/section";

export async function FeaturedListingsSection() {
  // Si el backend no responde, conservamos el resto de la Home y mostramos el estado vacio.
  const listings = await getPublicListingsServer(5).catch(() => ({
    items: [],
    total: 0,
    page: 1,
    pageSize: 5,
    hasMore: false,
  }));

  return (
    <HomeSection>
      <SectionHeading
        title="Propiedades destacadas"
        description="Una selección de inmuebles con excelente ubicación, valor y potencial."
        action={
          <Link
            href={ROUTES.properties}
            className="flex shrink-0 items-center gap-2 text-xs font-bold text-brand"
          >
            Ver todas
            <ArrowRightIcon className="size-4" />
          </Link>
        }
      />

      <ul className="mt-8 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {listings.items.map((listing) => (
          <li key={listing.id}>
            <FeaturedListingCard listing={listing} />
          </li>
        ))}
      </ul>
      {listings.items.length === 0 ? (
        <div className="mt-8 rounded-card border border-dashed border-edge bg-surface-muted p-8 text-center text-sm text-muted">
          Aún no hay propiedades publicadas.
        </div>
      ) : null}
    </HomeSection>
  );
}
