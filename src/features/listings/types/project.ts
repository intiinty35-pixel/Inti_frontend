import type { PropertyType, PriceInfo, LocationRef } from "@/features/listings/types/listing";

export type ProjectStatus = "preventa" | "en-construccion" | "entregado";

export interface Project {
  id: string;
  slug: string;
  name: string;
  developer: string;
  description: string;
  propertyType: PropertyType;
  location: LocationRef;
  images: string[];
  tourUrl?: string;
  startingPrice: PriceInfo;
  areaRange: {
    min: number;
    max: number;
  };
  lotsTotal?: number;
  lotsLabel?: string;
  deliveryAt?: string;
  deliveryStage?: string;
  features: string[];
  status: ProjectStatus;
  publishedAt: string;
}
