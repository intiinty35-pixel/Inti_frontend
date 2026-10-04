"use client";

import Link from "next/link";
import { HeartIcon } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { useFavorites } from "@/features/favorites/components/favorites-provider";

export interface FavoriteButtonProps {
  propertyId: string;
  title?: string;
  className?: string;
}

export function FavoriteButton({ propertyId, title, className }: FavoriteButtonProps) {
  const { favoriteIds, isLoading, error, isAuthenticated, pendingIds, toggle } = useFavorites();
  const isFavorite = favoriteIds.has(propertyId);
  const label = title ? `${title}: ` : "";
  const disabled = isLoading || Boolean(error) || pendingIds.has(propertyId);

  if (!isAuthenticated) {
    return (
      <Link
        href={ROUTES.login}
        aria-label={`${label}Inicia sesión para guardar en favoritos`}
        title="Inicia sesión para guardar en favoritos"
        className={cn(
          "flex size-9 items-center justify-center rounded-full bg-surface text-brand shadow-[var(--shadow-card)]",
          className,
        )}
      >
        <HeartIcon className="size-4" />
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={`${label}${isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}`}
      aria-pressed={isFavorite}
      disabled={disabled}
      title={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
      onClick={() => void toggle(propertyId)}
      className={cn(
        "flex size-9 items-center justify-center rounded-full bg-surface text-brand shadow-[var(--shadow-card)] transition-colors hover:text-red-600 disabled:cursor-wait disabled:opacity-60",
        className,
      )}
    >
      <HeartIcon className={cn("size-4", isFavorite && "fill-red-500 text-red-500")} />
      {error ? (
        <span
          role="alert"
          className="absolute top-11 right-0 z-20 max-w-52 rounded bg-red-700 px-2 py-1 text-left text-[10px] font-semibold text-white shadow-lg"
        >
          No se pudo actualizar: {error}
        </span>
      ) : null}
    </button>
  );
}