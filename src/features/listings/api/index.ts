import { apiClient } from "@/shared/lib/api/client";
import type { Listing, ListingFilters, PagedResult } from "@/features/listings/types/listing";
import type { Project } from "@/features/listings/types/project";
import type { Unit } from "@/features/listings/types/unit";

function buildQuery(filters: ListingFilters): string {
  const params = new URLSearchParams();

  if (filters.operation) params.set("operation", filters.operation);
  if (filters.type) params.set("type", filters.type);
  if (filters.district) params.set("district", filters.district);
  if (filters.province) params.set("province", filters.province);
  if (filters.priceMin !== undefined) params.set("priceMin", String(filters.priceMin));
  if (filters.priceMax !== undefined) params.set("priceMax", String(filters.priceMax));
  if (filters.roomsMin !== undefined) params.set("roomsMin", String(filters.roomsMin));
  if (filters.areaMin !== undefined) params.set("areaMin", String(filters.areaMin));
  if (filters.currency) params.set("currency", filters.currency);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.pageSize !== undefined) params.set("pageSize", String(filters.pageSize));

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getListings(filters: ListingFilters = {}): Promise<PagedResult<Listing>> {
  return apiClient.get<PagedResult<Listing>>(`/listings${buildQuery(filters)}`);
}

export async function getListingBySlug(slug: string): Promise<Listing> {
  return apiClient.get<Listing>(`/listings/${encodeURIComponent(slug)}`);
}

export async function getProjectBySlug(slug: string): Promise<Project> {
  return apiClient.get<Project>(`/projects/${encodeURIComponent(slug)}`);
}

export async function getProjectUnits(projectId: string): Promise<Unit[]> {
  return apiClient.get<Unit[]>(`/projects/${encodeURIComponent(projectId)}/units`);
}