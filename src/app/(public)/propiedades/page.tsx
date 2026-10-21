import type { Metadata } from "next";
import Link from "next/link";
import { Container, Pagination } from "@/shared/ui";
import { buildMetadata } from "@/shared/lib/seo";
import { formatPrice } from "@/shared/lib/format";
import { getListings, ListingCard, type ListingFilters } from "@/features/listings";
import { getPropertyTypeLabel } from "@/features/search";
import type {
  Listing,
  ListingOperation,
  PropertyType,
  SortOption,
} from "@/features/listings/types/listing";
import {
  PropertyFiltersBar,
  SortSelect,
  type PropertyFiltersValue,
} from "@/features/listings/components/property-filters-bar";
import { ListingsMapExperience } from "@/features/listings/components/listings-map-experience";
import type { MapPoint } from "@/features/listings/components/listings-map";
import { FavoriteButton } from "@/features/favorites";
import { ROUTES } from "@/shared/config/routes";
import { InvestmentGrowthBanner, MapExplorerSection } from "@/features/home";

const propertyMetadata: Metadata = buildMetadata({
  title: "Propiedades en venta y alquiler en Peru",
  description:
    "Encuentra propiedades en venta y alquiler: casas, departamentos, terrenos, lotes, locales y proyectos inmobiliarios publicados en Ariz Proyectos.",
  path: "/propiedades",
  keywords: [
    "propiedades en venta",
    "propiedades en alquiler",
    "casas en venta",
    "departamentos en alquiler",
    "terrenos en venta",
    "lotes en venta",
    "locales comerciales",
  ],
});

interface PropertiesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function valueOf(input: string | string[] | undefined) {
  return Array.isArray(input) ? input[0] : input;
}

function numberOf(input: string | string[] | undefined) {
  const value = valueOf(input);
  return value ? Number(value) : undefined;
}

const FILTERABLE_TYPES = new Set<PropertyType>(["houses", "apartments", "land", "country-lots", "commercial"]);
const PAGE_SIZE = 10;

function toListingPoints(items: readonly Listing[]): MapPoint[] {
  return items.flatMap((listing) => {
    const { lat, lng } = listing.location;

    if (lat === undefined || lng === undefined) {
      return [];
    }

    return [
      {
        id: listing.id,
        lat,
        lng,
        title: listing.title,
        priceLabel: formatPrice(listing.price.amount, listing.price.currency),
        districtLabel: `${listing.location.district}, ${listing.location.department}`,
        coverImage: listing.images[0],
        href: `/propiedades/${listing.slug}`,
        badge: listing.operation === "rent" ? "ALQUILER" : "VENTA",
        publishedAt: listing.publishedAt,
      },
    ];
  });
}

export async function generateMetadata({ searchParams }: PropertiesPageProps): Promise<Metadata> {
  const params = await searchParams;
  if (valueOf(params.type) === "projects") return buildMetadata({
    title: "Mapa de proyectos en Perú",
    description: "Explora los proyectos publicados, sus planos y las fichas de sus lotes en Google Maps.",
    path: "/propiedades?operation=buy&type=projects",
  });
  return propertyMetadata;
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const params = await searchParams;
  const rawType = valueOf(params.type);
  const requestedType = valueOf(params.type) as PropertyType | undefined;
  const isProjectMode = rawType === "projects";
  if (isProjectMode) return <MapExplorerSection />;
  const type = FILTERABLE_TYPES.has(rawType as PropertyType) ? (rawType as PropertyType) : undefined;
  const operation: ListingOperation = valueOf(params.operation) === "rent" ? "rent" : "buy";
  const district = valueOf(params.district);
  const roomsMin = numberOf(params.roomsMin);
  const priceMin = numberOf(params.priceMin);
  const priceMax = numberOf(params.priceMax);
  const areaMin = numberOf(params.areaMin);
  const sort = valueOf(params.sort) as SortOption | undefined;
  const page = numberOf(params.page) ?? 1;

  const filters: ListingFilters = {
    operation,
    type,
    district,
    priceMin,
    priceMax,
    roomsMin,
    areaMin,
    sort,
    page,
    pageSize: PAGE_SIZE,
  };
  const result = await getListings(filters).catch(() => ({
        items: [],
        total: 0,
        page,
        pageSize: PAGE_SIZE,
        hasMore: false,
      }));

  const totalLabel = `${result.total} propiedades disponibles`;
  const heading = requestedType ? getPropertyTypeLabel(requestedType) : "Propiedades";

  const currentParams: Record<string, string | undefined> = {
    operation,
    type: requestedType,
    district,
    roomsMin: roomsMin ? String(roomsMin) : undefined,
    priceMin: priceMin ? String(priceMin) : undefined,
    priceMax: priceMax ? String(priceMax) : undefined,
    areaMin: areaMin ? String(areaMin) : undefined,
  };

  function buildPageHref(targetPage: number) {
    const query = new URLSearchParams();
    Object.entries(currentParams).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    if (sort) query.set("sort", sort);
    if (targetPage > 1) query.set("page", String(targetPage));
    const search = query.toString();
    return search ? `/propiedades?${search}` : "/propiedades";
  }

  const filterBarValue: PropertyFiltersValue = {
    operation,
    type: (requestedType ?? undefined) as PropertyType | undefined,
    district,
    roomsMin,
    priceMin,
    priceMax,
    areaMin,
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <Container size="full" className="flex flex-1 flex-col gap-6 py-8">
        <div className="w-full min-w-0 overflow-x-auto">
          <PropertyFiltersBar basePath="/propiedades" value={filterBarValue} />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted">{totalLabel}</p>
            <h1 className="font-display text-3xl font-semibold text-ink">{heading}</h1>
          </div>
          <div className="grid grid-cols-2 gap-2 min-w-0 w-full sm:w-auto sm:flex sm:items-center sm:gap-2">
            <Link
              href={ROUTES.services}
              className="inline-flex h-10 items-center justify-center rounded-card border border-edge px-4 text-sm font-bold text-brand transition-colors hover:border-brand whitespace-nowrap"
            >
              Conócenos
            </Link>
            <div className="min-w-0">
              <SortSelect value={sort} basePath="/propiedades" currentParams={currentParams} />
            </div>
          </div>
        </div>

          <>
            <div className="grid w-full min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,380px)] 2xl:grid-cols-[minmax(0,1fr)_400px]">
              {result.items.length > 0 ? (
                <div className="flex w-full min-w-0 flex-col gap-4">
                  {result.items.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      favoriteAction={
                        <FavoriteButton propertyId={listing.id} title={listing.title} />
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-card border border-dashed border-edge bg-surface-muted p-10 text-center text-sm text-muted">
                  No encontramos propiedades con esos filtros.
                </div>
              )}

              <div className="w-full min-w-0 overflow-hidden lg:overflow-visible">
                <ListingsMapExperience
                  points={toListingPoints(result.items)}
                  filters={{ operation, type, district, roomsMin, priceMin, priceMax, areaMin }}
                  isProjectMode={false}
                />
              </div>
            </div>

            {result.items.length > 0 ? (
              <div className="w-full min-w-0 overflow-x-auto">
                <Pagination
                  page={page}
                  pageSize={PAGE_SIZE}
                  total={result.total}
                  buildHref={buildPageHref}
                />
              </div>
            ) : null}
          </>
      </Container>

      {operation === "buy" ? (
        <div className="w-full max-w-full overflow-hidden">
          <InvestmentGrowthBanner />
        </div>
      ) : null}
    </div>
  );
}