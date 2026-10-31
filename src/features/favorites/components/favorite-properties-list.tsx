"use client";

import Link from "next/link";
import { ArrowUpRight, Heart, House, Search } from "lucide-react";
import { Card, CardContent } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { FavoriteButton } from "@/features/favorites/components/favorite-button";
import { useFavorites } from "@/features/favorites/components/favorites-provider";
import type { Favorite } from "@/features/favorites/types/favorite";

export function FavoritePropertiesList({ favorites }: { favorites: Favorite[] }) {
  const { favoriteIds, hasLoaded } = useFavorites();
  const visibleFavorites =
    hasLoaded ? favorites.filter((favorite) => favoriteIds.has(favorite.propertyId)) : favorites;

  return (
    <section className="flex min-w-0 flex-col gap-4" aria-label="Propiedades favoritas">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-black tracking-[0.18em] text-accent uppercase">Tu lista guardada</p>
          <h2 className="mt-1 font-display text-2xl font-black tracking-tight text-brand">
            Propiedades que te interesan
          </h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-edge bg-surface px-3.5 py-2 text-sm font-bold text-brand">
          <Heart className="size-4 text-red-500" aria-hidden />
          {visibleFavorites.length} {visibleFavorites.length === 1 ? "favorito" : "favoritos"}
        </span>
      </div>
      {visibleFavorites.length ? (
        <ul className="grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {visibleFavorites.map((favorite) => (
            <li key={favorite.id}>
              <Card className="group relative h-full min-w-0 overflow-hidden transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]">
                <div className="absolute inset-x-0 top-0 h-1 bg-accent" aria-hidden />
                <CardContent className="flex h-full min-w-0 flex-col p-5 pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                      <House className="size-5" aria-hidden />
                    </span>
                    <FavoriteButton
                      propertyId={favorite.propertyId}
                      title={favorite.property.title}
                      className="relative mr-0 size-10 border border-edge"
                    />
                  </div>
                  <Link
                    href={ROUTES.property(favorite.property.slug)}
                    className="mt-4 line-clamp-2 min-h-12 break-words font-display text-lg font-bold leading-6 text-brand transition-colors group-hover:text-accent"
                  >
                    {favorite.property.title}
                  </Link>
                  <div className="mt-3 flex min-w-0 items-center justify-between gap-2 border-t border-edge pt-3">
                    <p className="truncate text-xs font-medium text-muted">
                      Guardada el{" "}
                      {new Date(favorite.createdAt).toLocaleDateString("es-BO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        timeZone: "UTC",
                      })}
                    </p>
                    <Link
                      href={ROUTES.property(favorite.property.slug)}
                      aria-label={`Ver ${favorite.property.title}`}
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-canvas text-brand transition-colors hover:bg-brand hover:text-on-brand"
                    >
                      <ArrowUpRight className="size-4" aria-hidden />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Card className="overflow-hidden">
          <div className="h-1.5 bg-accent" aria-hidden />
          <CardContent className="grid justify-items-center gap-5 px-5 py-10 text-center sm:px-10 sm:py-14">
            <span className="relative flex size-20 items-center justify-center rounded-3xl bg-red-500/10 text-red-500">
              <Heart className="size-9" aria-hidden />
              <span className="absolute -right-2 -bottom-2 flex size-9 items-center justify-center rounded-full border-4 border-surface bg-brand text-on-brand">
                <Search className="size-4" aria-hidden />
              </span>
            </span>
            <div className="max-w-xl">
              <p className="text-[11px] font-black tracking-[0.18em] text-accent uppercase">
                Tu próxima propiedad puede estar aquí
              </p>
              <h3 className="mt-2 font-display text-2xl font-black tracking-tight text-brand sm:text-3xl">
                Aún no tienes favoritos
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted">
                Explora los anuncios y toca el corazón de las propiedades que quieras comparar o revisar más adelante.
              </p>
            </div>
            <Link
              href={ROUTES.properties}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-card bg-brand px-5 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
            >
              <Search className="size-4" aria-hidden />
              Explorar propiedades
            </Link>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
