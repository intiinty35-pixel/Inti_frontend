import type { Metadata } from "next";
import { Container } from "@/shared/ui";
import { buildMetadata } from "@/shared/lib/seo";
import { getListings, ListingCard, type ListingFilters } from "@/features/listings";

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

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const params = await searchParams;
  const filters: ListingFilters = {
    operation: valueOf(params.operation) === "rent" ? "rent" : "buy",
    district: valueOf(params.district),
    priceMin: numberOf(params.priceMin),
    priceMax: numberOf(params.priceMax),
    roomsMin: numberOf(params.roomsMin),
    areaMin: numberOf(params.areaMin),
    sort: valueOf(params.sort) as ListingFilters["sort"],
    pageSize: 20,
  };
  const result = await getListings(filters);

  return (
    <Container className="flex flex-1 flex-col gap-6 py-8">
      <section className="rounded-card border border-edge bg-surface p-4 shadow-[var(--shadow-card)]">
        <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
          <input
            className="h-12 rounded-card border border-edge bg-surface px-4 text-sm text-ink outline-none focus:border-brand focus:ring-4 focus:ring-[var(--focus-ring)]"
            placeholder="Buscar ubicación"
            defaultValue={filters.district}
          />
          <select className="h-12 rounded-card border border-edge bg-surface px-3 text-sm text-ink">
            <option>Comprar</option>
            <option>Alquilar</option>
          </select>
          <select className="h-12 rounded-card border border-edge bg-surface px-3 text-sm text-ink">
            <option>Tipo de propiedad</option>
            <option>Departamento</option>
            <option>Casa</option>
            <option>Terreno</option>
          </select>
          <select className="h-12 rounded-card border border-edge bg-surface px-3 text-sm text-ink">
            <option>Dormitorios</option>
            <option>1 o más</option>
            <option>2 o más</option>
            <option>3 o más</option>
          </select>
          <button className="h-12 rounded-card border border-brand px-4 text-sm font-bold text-brand">
            Más filtros
          </button>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted">{result.total} propiedades disponibles</p>
          <h1 className="font-display text-3xl font-semibold text-ink">Propiedades</h1>
        </div>
        <div className="flex gap-2">
          <button className="h-10 rounded-card border border-edge px-4 text-sm font-bold text-brand">
            Crear alerta
          </button>
          <button className="h-10 rounded-card bg-brand px-4 text-sm font-bold text-on-brand">
            Ver mapa
          </button>
        </div>
      </div>

      {result.items.length > 0 ? (
        <div className="grid gap-4">
          {result.items.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="rounded-card border border-dashed border-edge bg-surface-muted p-10 text-center text-sm text-muted">
          No encontramos propiedades con esos filtros.
        </div>
      )}
    </Container>
  );
}
