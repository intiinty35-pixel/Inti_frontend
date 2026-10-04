export type { Favorite } from "@/features/favorites/types/favorite";

export { getFavorites } from "@/features/favorites/api";
export { FavoritesProvider, useFavorites } from "@/features/favorites/components/favorites-provider";
export { FavoritePropertiesList } from "@/features/favorites/components/favorite-properties-list";
export {
  FavoriteButton,
  type FavoriteButtonProps,
} from "@/features/favorites/components/favorite-button";