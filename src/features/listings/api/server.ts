import { backendFetch } from "@/shared/lib/api/server";
import type { Listing, PropertyEditData } from "@/features/listings/types/listing";

export async function getOwnerListingsServer(): Promise<Listing[]> {
  const response = await backendFetch("/properties/owner/me");

  if (!response.ok) {
    throw new Error(`No se pudieron cargar tus publicaciones (${response.status})`);
  }

  return (await response.json()) as Listing[];
}

/** Propiedad propia con todos sus datos, para editarla. `null` si no existe o no es suya. */
export async function getOwnerPropertyForEditServer(id: string): Promise<PropertyEditData | null> {
  const response = await backendFetch(`/properties/owner/${encodeURIComponent(id)}`);

  if (response.status === 404 || response.status === 403) return null;
  if (!response.ok) {
    throw new Error(`No se pudo cargar la propiedad (${response.status})`);
  }

  return (await response.json()) as PropertyEditData;
}

/** Propiedades ARIZ (publicadas desde el panel de administrador). */
export async function getAdminPropertiesPagedServer(page: number, pageSize = 9): Promise<PagedListings> {
  const response = await backendFetch(`/admin/properties?page=${page}&pageSize=${pageSize}`);

  if (!response.ok) {
    throw new Error(`No se pudieron cargar las propiedades de ARIZ (${response.status})`);
  }

  return (await response.json()) as PagedListings;
}

export interface PagedListings {
  items: Listing[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/** Propiedades publicadas para las secciones públicas del sitio. */
export async function getPublicListingsServer(pageSize = 5, page = 1): Promise<PagedListings> {
  const response = await backendFetch(`/properties?sort=recent&pageSize=${pageSize}&page=${page}`);

  if (!response.ok) {
    throw new Error(`No se pudieron cargar las propiedades (${response.status})`);
  }

  return (await response.json()) as PagedListings;
}

export async function getAllPublicListingsServer(pageSize = 50): Promise<Listing[]> {
  const firstPage = await getPublicListingsServer(pageSize, 1);
  const listings = [...firstPage.items];
  let page = 1;
  let hasMore = firstPage.hasMore;

  while (hasMore) {
    page += 1;
    const nextPage = await getPublicListingsServer(pageSize, page);
    if (nextPage.items.length === 0 && nextPage.hasMore) {
      throw new Error("La API de propiedades indicó más resultados, pero devolvió una página vacía.");
    }
    listings.push(...nextPage.items);
    hasMore = nextPage.hasMore;
  }

  return listings;
}

export async function getOwnerListingsPagedServer(page: number, pageSize = 6): Promise<PagedListings> {
  const response = await backendFetch(`/properties/owner/me?page=${page}&pageSize=${pageSize}`);

  if (!response.ok) {
    throw new Error(`No se pudieron cargar tus publicaciones (${response.status})`);
  }

  return (await response.json()) as PagedListings;
}
