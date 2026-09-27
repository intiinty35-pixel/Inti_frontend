import { apiClient } from "@/shared/lib/api/client";
import type { Listing, ListingFilters, PagedResult, PropertyCreateInput, PropertyDetail } from "@/features/listings/types/listing";
import type { Project } from "@/features/listings/types/project";
import type { Unit } from "@/features/listings/types/unit";

function buildQuery(filters: ListingFilters): string {
  const params = new URLSearchParams();

  if (filters.operation) params.set("operationType", toApiOperation(filters.operation));
  if (filters.type && filters.type !== "projects" && filters.type !== "country-lots") {
    params.set("propertyType", toApiPropertyType(filters.type));
  }
  if (filters.district) params.set("district", filters.district);
  if (filters.province) params.set("province", filters.province);
  if (filters.priceMin !== undefined) params.set("priceMin", String(filters.priceMin));
  if (filters.priceMax !== undefined) params.set("priceMax", String(filters.priceMax));
  if (filters.roomsMin !== undefined) params.set("bedroomsMin", String(filters.roomsMin));
  if (filters.areaMin !== undefined) params.set("areaMin", String(filters.areaMin));
  if (filters.currency) params.set("currency", filters.currency);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.pageSize !== undefined) params.set("pageSize", String(filters.pageSize));

  const query = params.toString();
  return query ? `?${query}` : "";
}

function toApiOperation(operation: NonNullable<ListingFilters["operation"]>): string {
  if (operation === "rent") return "RENT";
  return "SALE";
}

function toApiPropertyType(type: NonNullable<ListingFilters["type"]>): string {
  const map = {
    houses: "HOUSE",
    apartments: "APARTMENT",
    land: "LAND",
    commercial: "COMMERCIAL",
  } as const;
  return map[type as keyof typeof map] ?? "APARTMENT";
}

export async function getListings(filters: ListingFilters = {}): Promise<PagedResult<Listing>> {
  return apiClient.get<PagedResult<Listing>>(`/properties${buildQuery(filters)}`);
}

export async function getListingBySlug(slug: string): Promise<PropertyDetail> {
  return apiClient.get<PropertyDetail>(`/properties/${encodeURIComponent(slug)}`);
}

export async function getOwnerListings(): Promise<Listing[]> {
  return apiClient.get<Listing[]>("/properties/owner/me");
}

export async function createProperty(input: PropertyCreateInput): Promise<Listing> {
  return apiClient.post<Listing>("/properties", input);
}

export async function publishProperty(id: string): Promise<Listing> {
  return apiClient.patch<Listing>(`/properties/${encodeURIComponent(id)}/publish`);
}

export async function getProjectBySlug(slug: string): Promise<Project> {
  return apiClient.get<Project>(`/projects/${encodeURIComponent(slug)}`);
}

export async function getProjectUnits(projectId: string): Promise<Unit[]> {
  return apiClient.get<Unit[]>(`/projects/${encodeURIComponent(projectId)}/units`);
}
