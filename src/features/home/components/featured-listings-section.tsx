import Link from "next/link";
import { ArrowRightIcon } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { FeaturedListingCard, PREVIEW_FEATURED_LISTINGS } from "@/features/listings";
import { HomeSection, SectionHeading } from "@/features/home/components/section";

export function FeaturedListingsSection() {
  return (
    <HomeSection>
      <SectionHeading
        title="Propiedades destacadas"
        description="Las mejores oportunidades seleccionadas por nuestro equipo."
        action={
          <Link
            href={ROUTES.search({ operation: "buy", type: "all" })}
            className="flex shrink-0 items-center gap-2 text-xs font-bold text-brand"
          >
            Ver todas
            <ArrowRightIcon className="size-4" />
          </Link>
        }
      />

      <ul className="mt-6 grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {PREVIEW_FEATURED_LISTINGS.map((listing) => (
          <li key={listing.id}>
            <FeaturedListingCard listing={listing} />
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}
