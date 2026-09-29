import type { Metadata } from "next";
import { Container, Pagination } from "@/shared/ui";
import { buildMetadata } from "@/shared/lib/seo";
import { formatPrice } from "@/shared/lib/format";
import { getListings, ListingCard, ProjectListingCard, type ListingFilters } from "@/features/listings";
import { getPropertyTypeLabel } from "@/features/search";
import type {
  Listing,
  ListingOperation,
  PropertyType,
  SortOption,
} from "@/features/listings/types/listing";
import type { Project } from "@/features/listings/types/project";
import type { ProjectApiSummary } from "@/features/projects/types/api";
import {
  PropertyFiltersBar,
  SortSelect,
  type PropertyFiltersValue,
} from "@/features/listings/components/property-filters-bar";
import { ListingsMapExperience } from "@/features/listings/components/listings-map-experience";
import type { MapPoint } from "@/features/listings/components/listings-map";
import { getPublicProjectsServer } from "@/features/projects/api/server";
import { toProjectCardModel } from "@/features/projects/lib/project-card";

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

const FILTERABLE_TYPES = new Set<PropertyType>(["houses", "apartments", "land", "country-lots", "commercial"]);
const PAGE_SIZE = 10;

/** Cuantos proyectos se traen al mapa: el endpoint publico no pagina por tipo. */
const PROJECT_MAP_LIMIT = 60;

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

/** Proyectos publicados: se convierten al modelo de card + punto del mapa. */
function toProjectPoints(items: readonly ProjectApiSummary[]): {
  cards: Project[];
  points: MapPoint[];
} {
  const cards = items.map(toProjectCardModel);

  const points = cards.flatMap((project) => {
    const { lat, lng } = project.location;

    if (lat === undefined || lng === undefined) {
      return [];
    }

    return [
      {
        id: project.id,
        lat,
        lng,
        title: project.name,
        priceLabel: `Desde ${formatPrice(project.startingPrice.amount, project.startingPrice.currency)}`,
        districtLabel: `${project.location.district}, ${project.location.department}`,
        coverImage: project.images[0],
        href: `/project/${project.slug}`,
        badge: project.developer,
        publishedAt: project.publishedAt,
      },
    ];
  });

  return { cards, points };
}

/**
 * Rama "Proyectos": los proyectos viven en `/projects`, no en `/properties`, asi
 * que se consultan aparte y se reusan el card y el mapa del buscador.
 */
async function ProjectsResults({
  operation,
  district,
}: {
  operation: ListingOperation;
  district?: string;
}) {
  const page = await getPublicProjectsServer(PROJECT_MAP_LIMIT);
  const items = page.items.filter((project) => {
    if (district && project.location.district.toLowerCase() !== district.toLowerCase()) {
      return false;
    }
    // Los proyectos publicos son de venta; si el menu pide alquiler no hay nada.
    return operation !== "rent";
  });
  const { cards, points } = toProjectPoints(items);

  return (
    <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,380px)] 2xl:grid-cols-[minmax(0,1fr)_400px]">
      {cards.length > 0 ? (
        <div className="flex min-w-0 flex-col gap-4">
          {cards.map((project) => (
            <ProjectListingCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="rounded-card border border-dashed border-edge bg-surface-muted p-10 text-center text-sm text-muted">
          No encontramos proyectos publicados con esos filtros.
        </div>
      )}

      <ListingsMapExperience
        points={points}
        filters={{ operation, type: "projects", district }}
        isProjectMode
      />
    </div>
  );
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const params = await searchParams;
  const rawType = valueOf(params.type);
  const requestedType = valueOf(params.type) as PropertyType | undefined;
  const isProjectMode = rawType === "projects";
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
  const result = isProjectMode
    ? { items: [], total: 0, page, pageSize: PAGE_SIZE, hasMore: false }
    : await getListings(filters).catch(() => ({
        items: [],
        total: 0,
        page,
        pageSize: PAGE_SIZE,
        hasMore: false,
      }));
  // En modo proyectos el listado real viene de /projects: el contador de
  // propiedades no aplica y se omite en vez de mostrar un "0" enganoso.
  const totalLabel = isProjectMode
    ? "Proyectos publicados"
    : `${result.total} propiedades disponibles`;
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
    <Container size="full" className="flex flex-1 flex-col gap-6 py-8">
      <PropertyFiltersBar basePath="/propiedades" value={filterBarValue} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted">{totalLabel}</p>
          <h1 className="font-display text-3xl font-semibold text-ink">{heading}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-10 rounded-card border border-edge px-4 text-sm font-bold text-brand transition-colors hover:border-brand">
            Crear alerta
          </button>
          <SortSelect value={sort} basePath="/propiedades" currentParams={currentParams} />
        </div>
      </div>

      {isProjectMode ? (
        <ProjectsResults operation={operation} district={district} />
      ) : (
        <>
          <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,380px)] 2xl:grid-cols-[minmax(0,1fr)_400px]">
            {result.items.length > 0 ? (
              <div className="flex min-w-0 flex-col gap-4">
                {result.items.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="rounded-card border border-dashed border-edge bg-surface-muted p-10 text-center text-sm text-muted">
                No encontramos propiedades con esos filtros.
              </div>
            )}

            {/*
              La vista previa del mapa vive en la columna derecha. Al abrirla se
              monta el mapa interactivo completo (mismo panel de siempre) en un
              modal: en movil tambien aparece el boton flotante "Mapa".
            */}
            <ListingsMapExperience
              points={toListingPoints(result.items)}
              filters={{ operation, type, district, roomsMin, priceMin, priceMax, areaMin }}
              isProjectMode={false}
            />
          </div>

          {result.items.length > 0 ? (
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={result.total}
              buildHref={buildPageHref}
            />
          ) : null}
        </>
      )}
    </Container>
  );
}
