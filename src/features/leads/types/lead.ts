export type LeadSource = "web" | "search" | "property" | "project" | "favorites";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source: LeadSource;
  listingId?: string;
  createdAt: string;
}

export interface LeadInput {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source: LeadSource;
  listingId?: string;
  utm?: Record<string, string | undefined>;
}