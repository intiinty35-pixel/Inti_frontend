import type { Listing } from "@/features/listings/types/listing";

export type OperationType = "SALE" | "RENT" | "TEMPORARY_RENT" | "TRANSFER";

export type PropertyKind =
  | "APARTMENT"
  | "HOUSE"
  | "LAND"
  | "OFFICE"
  | "COMMERCIAL"
  | "WAREHOUSE"
  | "ROOM";

export const OPERATION_OPTIONS: readonly { value: OperationType; label: string }[] = [
  { value: "SALE", label: "Venta" },
  { value: "RENT", label: "Alquiler" },
];

export const PROPERTY_KIND_OPTIONS: readonly { value: PropertyKind; label: string }[] = [
  { value: "APARTMENT", label: "Departamento" },
  { value: "HOUSE", label: "Casa" },
  { value: "LAND", label: "Terreno" },
  { value: "OFFICE", label: "Oficina" },
  { value: "COMMERCIAL", label: "Local comercial" },
  { value: "WAREHOUSE", label: "Almacén" },
  { value: "ROOM", label: "Cochera" },
];

export const AMENITY_OPTIONS = [
  { code: "PISCINA", label: "Piscina" },
  { code: "JARDIN", label: "Jardín" },
  { code: "AREA_BBQ", label: "Área BBQ" },
  { code: "MASCOTAS_PERMITIDAS", label: "Mascotas permitidas" },
  { code: "TERRAZA", label: "Terraza" },
  { code: "ASCENSOR", label: "Ascensor" },
  { code: "GIMNASIO", label: "Gimnasio" },
  { code: "AMOBLADO", label: "Amoblado" },
  { code: "BALCON", label: "Balcón" },
  { code: "SEGURIDAD_24_7", label: "Seguridad 24/7" },
  { code: "SALON_SOCIAL", label: "Salón social" },
] as const;

export interface PropertyLocationDraft {
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
}

export interface PropertyDetailsDraft {
  totalArea?: number;
  constructedArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  halfBathrooms?: number;
  parkingSpaces?: number;
  floor?: number;
  floors?: number;
  constructionYear?: number;
}

export interface PropertyMediaDraft {
  url: string;
  publicId?: string;
  position?: number;
  isCover?: boolean;
}

export interface CreatePropertyPayload {
  operationType: OperationType;
  propertyType: PropertyKind;
  title: string;
  description: string;
  price: number;
  currency: "PEN" | "USD";
  negotiable?: boolean;
  maintenanceFee?: number;
  location: PropertyLocationDraft;
  details: PropertyDetailsDraft;
  amenityCodes?: string[];
  media: PropertyMediaDraft[];
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
}

export interface OwnerProperty extends Listing {
  featured: boolean;
  coverImage?: string;
  maintenanceFee: number | null;
  negotiable: boolean;
  details: PropertyDetailsDraft | null;
  amenities: { id: string; code: string; name: string }[];
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  source: "PROPERTY_FORM" | "PROJECT_FORM" | "WHATSAPP" | "QUICK_QUESTION" | "PHONE";
  createdAt: string;
  property: { id: string; slug: string; title: string } | null;
  project: { id: string; slug: string; name: string } | null;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ProfessionalProfile {
  id: string;
  type: "INDEPENDENT_AGENT" | "REAL_ESTATE_AGENCY" | "DEVELOPER";
  status: "PENDING" | "APPROVED" | "REJECTED";
  dni: string | null;
  ruc: string | null;
  businessName: string | null;
  whatsapp: string | null;
  city: string;
  districts: string | null;
  address: string | null;
  website: string | null;
  socialLinks: string | null;
  slug: string | null;
  user: { firstName: string; lastName: string | null; email: string; phone: string | null };
}
