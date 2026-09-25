import type { PriceInfo, ListingOperation, ListingStatus } from "@/features/listings/types/listing";

export interface Unit {
  id: string;
  projectId: string;
  label: string;
  operation: ListingOperation;
  price: PriceInfo;
  bedrooms: number;
  bathrooms: number;
  areaM2: number;
  floor?: number;
  status: ListingStatus;
}