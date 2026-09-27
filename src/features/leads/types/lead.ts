export type LeadSource = "PROPERTY_FORM" | "WHATSAPP" | "QUICK_QUESTION" | "PHONE";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source: LeadSource;
  propertyId: string;
  createdAt: string;
}

export interface LeadInput {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source: LeadSource;
  propertyId: string;
  utm?: Record<string, string | undefined>;
}
