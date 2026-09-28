import Link from "next/link";
import { ArrowRightIcon } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
<<<<<<< HEAD
import { FeaturedListingCard, PREVIEW_FEATURED_LISTINGS } from "@/features/listings";
import { HomeSection, SectionHeading } from "@/features/home/components/section";

export function FeaturedListingsSection() {
=======
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

>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
  return (
    <HomeSection>
      <SectionHeading
        title="Propiedades destacadas"
<<<<<<< HEAD
        description="Las mejores oportunidades seleccionadas por nuestro equipo."
        action={
          <Link
            href={ROUTES.search({ operation: "buy", type: "all" })}
=======
        description="Una selección de inmuebles con excelente ubicación, valor y potencial."
        action={
          <Link
            href={ROUTES.properties}
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
            className="flex shrink-0 items-center gap-2 text-xs font-bold text-brand"
          >
            Ver todas
            <ArrowRightIcon className="size-4" />
          </Link>
        }
      />

<<<<<<< HEAD
      <ul className="mt-6 grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {PREVIEW_FEATURED_LISTINGS.map((listing) => (
=======
      <ul className="mt-6 grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {listings.items.map((listing) => (
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
          <li key={listing.id}>
            <FeaturedListingCard listing={listing} />
          </li>
        ))}
      </ul>
<<<<<<< HEAD
=======
      {listings.items.length === 0 ? (
        <div className="mt-6 rounded-card border border-dashed border-edge bg-surface-muted p-8 text-center text-sm text-muted">
          Aún no hay propiedades publicadas.
        </div>
      ) : null}
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
    </HomeSection>
  );
}
