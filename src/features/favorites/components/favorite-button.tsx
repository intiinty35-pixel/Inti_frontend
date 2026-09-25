"use client";

import { Button } from "@/shared/ui";

export interface FavoriteButtonProps {
  listingId: string;
  title?: string;
}

export function FavoriteButton({ listingId, title }: FavoriteButtonProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      aria-label={title ? `${title} - favorite` : `Favorite ${listingId}`}
    >
      ☆ Favorite
    </Button>
  );
}