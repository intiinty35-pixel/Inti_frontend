import { formatPrice } from "@/shared/lib/format";
import { MapListingCard, PREVIEW_MAP_LISTINGS } from "@/features/listings";
import { HomeSection, SectionHeading } from "@/features/home/components/section";
import { MapPlaceholder, type MapMarker } from "@/features/home/components/map-placeholder";

const MARKERS: readonly MapMarker[] = PREVIEW_MAP_LISTINGS.map((listing) => ({
  id: listing.id,
  price: formatPrice(listing.price.amount, listing.price.currency),
  lat: listing.location.lat,
  lng: listing.location.lng,
}));

export function MapExplorerSection() {
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
          <MapPlaceholder markers={MARKERS} />
        </div>
      </div>
    </HomeSection>
  );
}
