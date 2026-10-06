import { backendFetch } from "@/shared/lib/api/server";
import type {
  IncentiveListResponse,
  RedemptionListResponse,
  RedemptionWithDetails,
} from "../types/rewards";

export async function listAdminIncentivesServer(
  page = 1,
  pageSize = 20,
  status?: string,
): Promise<IncentiveListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (status) params.append("status", status);

  try {
    const response = await backendFetch(`/admin/incentives?${params}`);
    if (!response.ok) {
      return { items: [], total: 0, page, pageSize };
    }
    return (await response.json()) as IncentiveListResponse;
  } catch {
    return { items: [], total: 0, page, pageSize };
  }
}

export async function getAdminIncentiveServer(id: string): Promise<any | null> {
  try {
    const response = await backendFetch(`/admin/incentives/${id}`);
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as any;
  } catch {
    return null;
  }
}

export async function listAdminRedemptionsServer(
  page = 1,
  pageSize = 20,
  status?: string,
): Promise<RedemptionListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (status) params.append("status", status);

  try {
    const response = await backendFetch(`/admin/redemptions?${params}`);
    if (!response.ok) {
      return { items: [], total: 0, page, pageSize };
    }
    return (await response.json()) as RedemptionListResponse;
  } catch {
    return { items: [], total: 0, page, pageSize };
  }
}

export async function getAdminRedemptionServer(
  id: string,
): Promise<RedemptionWithDetails | null> {
  try {
    const response = await backendFetch(`/admin/redemptions/${id}`);
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as RedemptionWithDetails;
  } catch {
    return null;
  }
}
