export interface AdminPromotion {
  id: string;
  title: string;
  imageUrl: string;
  publicId: string | null;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

export interface CurrentPromotion {
  id: string;
  title: string;
  imageUrl: string;
}
