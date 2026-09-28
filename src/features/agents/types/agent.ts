import type { Listing } from "@/features/listings";

export interface AgentProfile {
  id: string;
  name: string;
  type: string;
  status: string;
  whatsapp?: string | null;
  phone?: string | null;
  email: string;
  city: string;
  districts?: string | null;
  address?: string | null;
  website?: string | null;
  properties: Listing[];
}
