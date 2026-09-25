import { Card, CardContent } from "@/shared/ui";
import { getFavorites } from "@/features/favorites";

export default async function PanelClientFavoritesPage() {
  const favorites = await getFavorites();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-semibold text-ink">My favorites</h1>
      <p className="text-sm text-muted">
        You have {favorites.length} saved properties.
      </p>
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted">
          Your favorite properties will appear here.
        </CardContent>
      </Card>
    </div>
  );
}