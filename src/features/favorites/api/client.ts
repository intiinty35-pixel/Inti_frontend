import type { Favorite } from "@/features/favorites/types/favorite";

export async function getFavoritesClient(): Promise<Favorite[]> {
  const response = await fetch("/api/favorites", {
    credentials: "include",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`No se pudieron cargar tus favoritos (${response.status})`);
  }

  return (await response.json()) as Favorite[];
}

export async function toggleFavorite(propertyId: string): Promise<boolean> {
  const response = await fetch("/api/favorites/toggle", {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ propertyId }),
  });

  if (!response.ok) {
    throw new Error(`No se pudo actualizar el favorito (${response.status})`);
  }

  const result = (await response.json()) as { active: boolean };
  return result.active;
}
