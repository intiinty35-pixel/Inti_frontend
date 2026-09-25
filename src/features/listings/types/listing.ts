export type Currency = "PEN" | "USD";

export type ListingOperation = "buy" | "rent" | "invest";

export type PropertyType = "houses" | "apartments" | "land" | "projects" | "country-lots";

export type ListingStatus = "disponible" | "reservado" | "vendido" | "alquilado";

export type SortOption = "recent" | "price-asc" | "price-desc";

export interface LocationRef {
  department: string;
  province: string;
  district: string;
  address?: string;
  lat?: number;
  lng?: number;
}

export interface PriceInfo {
  amount: number;
  currency: Currency;
  period?: "total" | "mensual" | "anual";
}

export interface Listing {
  id: string;
  slug: string;
  title: string;
  description: string;
  operation: ListingOperation;
  type: PropertyType;
  price: PriceInfo;
  location: LocationRef;
  images: string[];
  rooms: number;
  bathrooms: number;
  areaM2: number;
  status: ListingStatus;
  projectId?: string;
  publishedAt: string;
}

export interface ListingFilters {
  operation?: ListingOperation;
  type?: PropertyType;
  district?: string;
  province?: string;
  priceMin?: number;
  priceMax?: number;
  currency?: Currency;
  roomsMin?: number;
  areaMin?: number;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}