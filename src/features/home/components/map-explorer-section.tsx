import { MapListingCard } from "@/features/listings";
import { getPublicListingsServer } from "@/features/listings/api/server";
import { HomeSection, SectionHeading } from "@/features/home/components/section";
import { MapListingsMapClient, type MapListingMarker } from "@/features/home/components/map-listings-map-client";
import { getPublicProjectsServer } from "@/features/projects/api/server";
import { formatPrice } from "@/shared/lib/format";

const MAP_PAGE_SIZE = 50;

export async function MapExplorerSection() {
  const [propertyPage, projectMarkers] = await Promise.all([
    getPublicListingsServer(MAP_PAGE_SIZE)
      .catch(() => ({ items: [], total: 0, page: 1, pageSize: MAP_PAGE_SIZE, hasMore: false })),
    getPublicProjectsServer(MAP_PAGE_SIZE)
      .then(({ items }) =>
        items.flatMap((project): MapListingMarker[] => {
          const { lat, lng } = project.location;
          if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
            return [];
          }

          return [{
            id: `project-${project.id}`,
            href: `/project/${project.slug}`,
            kind: "project",
            title: project.name,
            district: project.location.district,
            price: `Desde ${formatPrice(project.priceFrom, project.currency)}`,
            lat,
            lng,
          }];
        }),
      )
      .catch(() => [] as MapListingMarker[]),
  ]);
  const propertyMarkers = propertyPage.items.flatMap((listing): MapListingMarker[] => {
    const { lat, lng } = listing.location;
    if (lat === undefined || lng === undefined || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      return [];
    }

    return [{
      id: `property-${listing.id}`,
      href: `/propiedades/${listing.slug}`,
      kind: "property",
      title: listing.title,
      district: listing.location.district,
      price: formatPrice(listing.price.amount, listing.price.currency),
      lat,
      lng,
    }];
  });
  const mapMarkers = [...propertyMarkers, ...projectMarkers];

  return (
    <HomeSection id="mapa">
      <SectionHeading
        title="Encuentra propiedades en el mapa"
        description="Revisa las propiedades disponibles por zona y elige la que mejor se adapte a ti."
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-2 xl:gap-6">
        <ul className="order-2 flex max-h-[520px] snap-y snap-proximity flex-col gap-3 overflow-y-auto pr-1 lg:order-1 lg:h-[560px] lg:max-h-none xl:h-[640px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-edge">
          {propertyPage.items.slice(0, 6).map((listing) => (
            <li key={listing.id}>
              <MapListingCard listing={listing} />
            </li>
          ))}
          {propertyPage.items.length === 0 ? (
            <li className="rounded-card border border-dashed border-edge bg-surface p-6 text-center text-sm text-muted">
              Aún no hay propiedades publicadas.
            </li>
          ) : null}
        </ul>

        <div className="order-1 lg:order-2">
          <MapListingsMapClient markers={mapMarkers} />
        </div>
      </div>
    </HomeSection>
  );
}
