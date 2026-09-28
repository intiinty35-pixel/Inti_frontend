export type SearchOperation = "buy" | "rent" | "invest";

export type SearchPropertyType =
  | "all"
  | "houses"
  | "apartments"
  | "land"
  | "projects"
  | "country-lots"
  | "commercial";

<<<<<<< HEAD
export type SearchCurrency = "PEN" | "USD";

=======
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
export type SearchQuery = Record<string, string | string[] | undefined>;

export interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
}

export interface SearchOption<T extends string> {
  value: T;
  label: string;
}

export const SEARCH_OPERATIONS: readonly SearchOption<SearchOperation>[] = [
  { value: "buy", label: "Comprar" },
  { value: "rent", label: "Alquilar" },
  { value: "invest", label: "Invertir" },
];

export const SEARCH_PROPERTY_TYPES: readonly SearchOption<SearchPropertyType>[] = [
  { value: "all", label: "Todos los inmuebles" },
  { value: "houses", label: "Casas" },
  { value: "apartments", label: "Departamentos" },
  { value: "land", label: "Terrenos" },
  { value: "projects", label: "Proyectos" },
  { value: "country-lots", label: "Lotes campestres" },
  { value: "commercial", label: "Locales comerciales" },
];

<<<<<<< HEAD
export const SEARCH_CURRENCIES: readonly SearchOption<SearchCurrency>[] = [
  { value: "PEN", label: "S/ Soles" },
  { value: "USD", label: "$ Dólares" },
];

=======
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
export function getOperationLabel(operation: string): string {
  return (
    SEARCH_OPERATIONS.find((option) => option.value === operation)?.label ?? "Propiedades"
  );
}

export function getPropertyTypeLabel(type: string): string {
  return SEARCH_PROPERTY_TYPES.find((option) => option.value === type)?.label ?? "";
}

function toNumber(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);

  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseSearchFilters(searchParams: SearchQuery): SearchFilters {
  return {
    minPrice: toNumber(searchParams.price_min),
    maxPrice: toNumber(searchParams.price_max),
    bedrooms: toNumber(searchParams.bedrooms),
  };
}