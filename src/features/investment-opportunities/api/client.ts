import { apiClient } from "@/shared/lib/api/client";
import type {
  InvestmentOpportunity,
  InvestmentOpportunityInput,
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
