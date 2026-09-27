import { backendFetch } from "@/shared/lib/api/server";
import type { Listing } from "@/features/listings/types/listing";

export async function getOwnerListingsServer(): Promise<Listing[]> {
  const response = await backendFetch("/properties/owner/me");

  if (!response.ok) {
    throw new Error(`No se pudieron cargar tus publicaciones (${response.status})`);
  }

  return (await response.json()) as Listing[];
}
