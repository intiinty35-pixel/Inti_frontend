import Link from "next/link";
import { ArrowRightIcon } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { FeaturedListingCard, getListings } from "@/features/listings";
import { HomeSection, SectionHeading } from "@/features/home/components/section";

export async function FeaturedListingsSection() {
  // La home es estatica y se prerrenderiza en el build. Si la API no responde en ese
  // momento, no debe romper el build completo: se muestra el estado vacio.
  const listings = await getListings({ sort: "recent", pageSize: 5 }).catch(() => ({
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

      <ul className="mt-6 grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {listings.items.map((listing) => (
          <li key={listing.id}>
            <FeaturedListingCard listing={listing} />
          </li>
        ))}
      </ul>
      {listings.items.length === 0 ? (
        <div className="mt-6 rounded-card border border-dashed border-edge bg-surface-muted p-8 text-center text-sm text-muted">
          Aún no hay propiedades publicadas.
        </div>
      ) : null}
    </HomeSection>
  );
}
