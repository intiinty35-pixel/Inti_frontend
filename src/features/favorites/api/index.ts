import type { Favorite } from "@/features/favorites/types/favorite";
import { backendFetch } from "@/shared/lib/api/server";

export async function getFavorites(): Promise<Favorite[]> {
  const response = await backendFetch("/favorites");

  if (!response.ok) {
    throw new Error(`No se pudieron cargar tus favoritos (${response.status})`);
  }

  return (await response.json()) as Favorite[];
}