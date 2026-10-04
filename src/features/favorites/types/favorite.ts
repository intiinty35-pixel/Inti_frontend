export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string;
  property: {
    id: string;
    slug: string;
    title: string;
  };
}