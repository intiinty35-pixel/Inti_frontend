import { MapListingCard, PREVIEW_MAP_LISTINGS } from "@/features/listings";
import { getListings } from "@/features/listings/api";
import { HomeSection, SectionHeading } from "@/features/home/components/section";
import { MapListingsMapClient, type MapListingMarker } from "@/features/home/components/map-listings-map-client";
import { getPublicProjectsServer } from "@/features/projects/api/server";
import { formatPrice } from "@/shared/lib/format";

const MAP_PAGE_SIZE = 50;

export async function MapExplorerSection() {
  const [propertyMarkers, projectMarkers] = await Promise.all([
    getListings({ sort: "recent", pageSize: MAP_PAGE_SIZE })
      .then(({ items }) =>
        items.flatMap((listing): MapListingMarker[] => {
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
        }),
      )
      .catch(() => [] as MapListingMarker[]),
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
  const mapMarkers = [...propertyMarkers, ...projectMarkers];

  return (
    <HomeSection id="mapa">
      <SectionHeading
        title="Encuentra propiedades en el mapa"
        description="Revisa las propiedades disponibles por zona y elige la que mejor se adapte a ti."
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ul className="order-2 flex max-h-[520px] snap-y snap-proximity flex-col gap-3 overflow-y-auto pr-1 lg:order-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-edge">
          {PREVIEW_MAP_LISTINGS.map((listing) => (
            <li key={listing.id}>
              <MapListingCard listing={listing} />
            </li>
          ))}
        </ul>

        <div className="order-1 lg:order-2">
          <MapListingsMapClient markers={mapMarkers} />
        </div>
      </div>
    </HomeSection>
  );
}
