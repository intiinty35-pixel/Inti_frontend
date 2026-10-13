export type Currency = "PEN" | "USD";

export type ListingOperation = "buy" | "rent" | "invest";

export type PropertyType =
  | "houses"
  | "apartments"
  | "land"
  | "projects"
  | "country-lots"
  | "commercial";

export type PropertyReviewStatus = "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED";
export type ListingStatus = "disponible" | "reservado" | "vendido" | "alquilado" | PropertyReviewStatus;

export const PROPERTY_STATUS_LABELS: Record<PropertyReviewStatus, string> = {
  DRAFT: "Borrador",
  PENDING_REVIEW: "En revisión",
  PUBLISHED: "Publicado",
  REJECTED: "Rechazado",
};

export type SortOption = "recent" | "price-asc" | "price-desc";

export type ApiOperationType = "SALE" | "RENT" | "TEMPORARY_RENT" | "TRANSFER";
export type ApiPropertyType =
  | "APARTMENT"
  | "HOUSE"
  | "LAND"
  | "OFFICE"
  | "COMMERCIAL"
  | "WAREHOUSE"
  | "ROOM"
  | "PARKING";
export type ApiCurrency = "PEN" | "USD";
export type ApiConservationStatus =
  | "NEW"
  | "EXCELLENT"
  | "GOOD"
  | "REMODELED"
  | "TO_REMODEL"
  | "UNDER_CONSTRUCTION";

export interface PropertyCreateInput {
  operationType: ApiOperationType;
  propertyType: ApiPropertyType;
  title: string;
  description: string;
  price: number;
  currency: ApiCurrency;
  negotiable?: boolean;
  maintenanceFee?: number;
  location: {
    department: string;
    province: string;
    district: string;
    address: string;
    number?: string;
    sector?: string;
    reference?: string;
    latitude?: number;
    longitude?: number;
    approximateLocation: boolean;
  };
  details: {
    totalArea?: number;
    constructedArea?: number;
    bedrooms?: number;
    bathrooms?: number;
    halfBathrooms?: number;
    parkingSpaces?: number;
    floor?: number;
    floors?: number;
    constructionYear?: number;
    conservationStatus?: ApiConservationStatus;
    specificDetails?: Record<string, string | number | boolean | undefined>;
  };
  amenityCodes?: string[];
  media: Array<{
    url: string;
    publicId?: string;
    position?: number;
    isCover?: boolean;
  }>;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
}

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
  parkingSpaces?: number;
  areaM2: number;
  status: ListingStatus;
  projectId?: string;
  publishedAt: string;
  contactWhatsapp?: string | null;
  agent?: {
    id: string;
    type: string;
    status: string;
  };
  /** Codigos de servicios. El listado publico puede omitirlos; se usan para afinidad. */
  amenityCodes?: string[];
}

export interface PropertyDetail extends Listing {
  maintenanceFee: number | null;
  negotiable: boolean;
  details?: {
    totalArea?: number | string | null;
    constructedArea?: number | string | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    halfBathrooms?: number | null;
    parkingSpaces?: number | null;
    floor?: number | null;
    floors?: number | null;
    constructionYear?: number | null;
    conservationStatus?: ApiConservationStatus | null;
    specificDetails?: Record<string, unknown> | null;
  } | null;
  amenities: Array<{
    id: string;
    code: string;
    name: string;
    category: string;
  }>;
  agent: {
    id: string;
    name: string;
    type: string;
    status: string;
    whatsapp?: string | null;
    phone?: string | null;
    email: string;
  };
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

/** Propiedad propia con todos los datos que necesita el formulario de edicion. */
export interface PropertyEditData {
  id: string;
  slug: string;
  status: string;
  operationType: ApiOperationType;
  propertyType: ApiPropertyType;
  title: string;
  description: string;
  price: number;
  currency: ApiCurrency;
  negotiable: boolean;
  maintenanceFee: number | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  location: {
    department: string;
    province: string;
    district: string;
    address: string;
    number: string | null;
    sector: string | null;
    reference: string | null;
    latitude: number | null;
    longitude: number | null;
    approximateLocation: boolean;
  } | null;
  details: {
    totalArea: number | null;
    constructedArea: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    halfBathrooms: number | null;
    parkingSpaces: number | null;
    floor: number | null;
    floors: number | null;
    constructionYear: number | null;
    conservationStatus: ApiConservationStatus | null;
    specificDetails: Record<string, unknown> | null;
  } | null;
  amenityCodes: string[];
  media: Array<{ url: string; publicId: string | null; position: number; isCover: boolean }>;
}
