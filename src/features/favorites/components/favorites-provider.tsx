"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getFavoritesClient, toggleFavorite } from "@/features/favorites/api/client";

interface FavoritesContextValue {
  favoriteIds: ReadonlySet<string>;
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  isAuthenticated: boolean;
  pendingIds: ReadonlySet<string>;
  toggle: (propertyId: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({
  children,
  isAuthenticated,
}: {
  children: ReactNode;
  isAuthenticated: boolean;
}) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set());
  const [isLoading, setIsLoading] = useState(isAuthenticated);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let active = true;
    getFavoritesClient()
      .then((favorites) => {
        if (active) {
          setFavoriteIds(new Set(favorites.map((favorite) => favorite.propertyId)));
          setHasLoaded(true);
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "No se pudieron cargar tus favoritos.",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const toggle = useCallback(async (propertyId: string) => {
    setError(null);
    setPendingIds((current) => new Set(current).add(propertyId));
    try {
      const active = await toggleFavorite(propertyId);
      setFavoriteIds((current) => {
        const next = new Set(current);
        if (active) next.add(propertyId);
        else next.delete(propertyId);
        return next;
      });
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo actualizar el favorito.",
      );
    } finally {
      setPendingIds((current) => {
        const next = new Set(current);
        next.delete(propertyId);
        return next;
      });
    }
  }, []);

  const value = useMemo(
    () => ({ favoriteIds, isLoading, hasLoaded, error, isAuthenticated, pendingIds, toggle }),
    [favoriteIds, isLoading, hasLoaded, error, isAuthenticated, pendingIds, toggle],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites debe usarse dentro de FavoritesProvider.");
  }
  return context;
}
