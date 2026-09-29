export type LeadSource = "PROPERTY_FORM" | "PROJECT_FORM" | "WHATSAPP" | "QUICK_QUESTION" | "PHONE";

export type LeadTarget =
  | { propertyId: string; projectId?: never }
  | { projectId: string; propertyId?: never };

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source: LeadSource;
  propertyId?: string;
  projectId?: string;
  createdAt: string;
}

export type LeadInput = {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source: LeadSource;
  utm?: Record<string, string | undefined>;
} & LeadTarget;
