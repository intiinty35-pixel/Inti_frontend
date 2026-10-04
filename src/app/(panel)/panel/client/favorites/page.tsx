import { Heart, Sparkles } from "lucide-react";
import { FavoritePropertiesList, getFavorites } from "@/features/favorites";

export default async function PanelClientFavoritesPage() {
  const favorites = await getFavorites();

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <header className="relative overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)]">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-brand" aria-hidden />
        <div className="relative flex min-w-0 items-start gap-4 p-6 sm:items-center sm:p-8">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 sm:size-14">
            <Heart className="size-6 sm:size-7" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[11px] font-black tracking-[0.18em] text-accent uppercase">
              <Sparkles className="size-3.5" aria-hidden />
              Tu selección personal
            </p>
            <h1 className="mt-1 break-words font-display text-3xl font-black tracking-tight text-brand sm:text-4xl">
              Mis favoritos
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Guarda las propiedades que te interesan y vuelve a ellas cuando quieras.
            </p>
          </div>
        </div>
      </header>
      <FavoritePropertiesList favorites={favorites} />
    </div>
  );
}
