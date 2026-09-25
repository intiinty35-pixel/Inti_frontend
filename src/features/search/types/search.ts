export type SearchOperation = "buy" | "rent" | "invest";

export type SearchPropertyType =
  | "houses"
  | "apartments"
  | "land"
  | "projects"
  | "country-lots";

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
  { value: "buy", label: "Buy" },
  { value: "rent", label: "Rent" },
  { value: "invest", label: "Invest" },
];

export const SEARCH_PROPERTY_TYPES: readonly SearchOption<SearchPropertyType>[] = [
  { value: "houses", label: "Houses" },
  { value: "apartments", label: "Apartments" },
  { value: "land", label: "Land" },
  { value: "projects", label: "Projects" },
  { value: "country-lots", label: "Country lots" },
];

export function getOperationLabel(operation: string): string {
  return (
    SEARCH_OPERATIONS.find((option) => option.value === operation)?.label ?? "Properties"
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