import { Card, CardContent } from "@/shared/ui";
import { getFavorites } from "@/features/favorites";

export default async function PanelClientFavoritesPage() {
  const favorites = await getFavorites();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-light text-brand">Mis favoritos</h1>
      <p className="text-sm text-muted">Tienes {favorites.length} propiedades guardadas.</p>
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted">
          Tus propiedades favoritas aparecerán aquí.
        </CardContent>
      </Card>
    </div>
  );
}
