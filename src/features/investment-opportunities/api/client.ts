import { apiClient } from "@/shared/lib/api/client";
import type {
  InvestmentOpportunity,
  InvestmentOpportunityInput,
  InvestmentType,
  InvestmentTypeInput,
} from "@/features/investment-opportunities/types";

const ADMIN_ENDPOINT = "/admin/investment-opportunities";

export function createInvestmentOpportunity(input: InvestmentOpportunityInput) {
  return apiClient.post<InvestmentOpportunity>(ADMIN_ENDPOINT, input);
}

export function updateInvestmentOpportunity(
  id: string,
  input: InvestmentOpportunityInput,
) {
  return apiClient.patch<InvestmentOpportunity>(
    `${ADMIN_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
}

export function deleteInvestmentOpportunity(id: string) {
  return apiClient.delete<{ id: string; deleted: boolean }>(
    `${ADMIN_ENDPOINT}/${encodeURIComponent(id)}`,
  );
}

export function createInvestmentType(input: InvestmentTypeInput) {
  return apiClient.post<InvestmentType>(`${ADMIN_ENDPOINT}/types`, input);
}

export function updateInvestmentType(id: string, input: InvestmentTypeInput) {
  return apiClient.patch<InvestmentType>(
    `${ADMIN_ENDPOINT}/types/${encodeURIComponent(id)}`,
    input,
  );
}

export function deleteInvestmentType(id: string) {
  return apiClient.delete<{ id: string; deleted: boolean }>(
    `${ADMIN_ENDPOINT}/types/${encodeURIComponent(id)}`,
  );
}
