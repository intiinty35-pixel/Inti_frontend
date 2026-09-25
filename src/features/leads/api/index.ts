import { apiClient } from "@/shared/lib/api/client";
import type { Lead, LeadInput } from "@/features/leads/types/lead";

export async function createLead(input: LeadInput): Promise<Lead> {
  return apiClient.post<Lead>("/leads", input);
}