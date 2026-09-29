import type { Metadata } from "next";
import { Container, Pagination } from "@/shared/ui";
import { buildMetadata } from "@/shared/lib/seo";
import { getListings, ListingCard, type ListingFilters } from "@/features/listings";
import { getPropertyTypeLabel } from "@/features/search";
import type { ListingOperation, PropertyType, SortOption } from "@/features/listings/types/listing";
import {
  PropertyFiltersBar,
  SortSelect,
} from "@/features/listings/components/property-filters-bar";
import { MapPlaceholderPanel } from "@/features/listings/components/map-placeholder-panel";

export const metadata: Metadata = buildMetadata({
  title: "Propiedades en venta y alquiler | ARIZ",
  description: "Encuentra casas, departamentos, terrenos y locales publicados en ARIZ.",
  path: "/propiedades",
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

const FILTERABLE_TYPES = new Set<PropertyType>(["houses", "apartments", "land", "commercial"]);
const PAGE_SIZE = 12;

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const params = await searchParams;
  const rawType = valueOf(params.type);
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
  const result = await getListings(filters);
  const heading = type ? getPropertyTypeLabel(type) : "Propiedades";

  const currentParams: Record<string, string | undefined> = {
    operation,
    type,
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

  return (
    <Container size="full" className="flex flex-1 flex-col gap-6 py-8">
      <PropertyFiltersBar
        basePath="/propiedades"
        value={{ operation, type, district, roomsMin, priceMin, priceMax, areaMin }}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted">{result.total} propiedades disponibles</p>
          <h1 className="font-display text-3xl font-semibold text-ink">{heading}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-10 rounded-card border border-edge px-4 text-sm font-bold text-brand transition-colors hover:border-brand">
            Crear alerta
          </button>
          <SortSelect value={sort} basePath="/propiedades" currentParams={currentParams} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {result.items.length > 0 ? (
          <div className="flex flex-col gap-4">
            {result.items.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
            <div className="pt-2">
              <Pagination page={page} pageSize={PAGE_SIZE} total={result.total} buildHref={buildPageHref} />
            </div>
          </div>
        ) : (
          <div className="rounded-card border border-dashed border-edge bg-surface-muted p-10 text-center text-sm text-muted">
            No encontramos propiedades con esos filtros.
          </div>
        )}

        <div className="hidden lg:block">
          <MapPlaceholderPanel />
        </div>
      </div>
    </Container>
  );
}
