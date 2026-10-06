import { apiClient } from "@/shared/lib/api/client";
import type {
  Incentive,
  IncentiveListResponse,
  ReferrerAccess,
  Redemption,
  RedemptionListResponse,
} from "../types/rewards";

export function validateReferrerAccess(referralCode: string) {
  return apiClient.post<ReferrerAccess>("/redemptions/access", { referralCode });
}

export function getRewardsCatalog() {
  return apiClient.get<Incentive[]>("/redemptions/catalog");
}

export function requestRedemption(referralCode: string, incentiveId: string, quantity: number = 1) {
  return apiClient.post<Redemption>("/redemptions", {
    referralCode,
    incentiveId,
    quantity,
  });
}

export function getMyRedemptions(referralCode: string) {
  return apiClient.get<Redemption[]>(
    `/redemptions/my?code=${encodeURIComponent(referralCode)}`,
  );
}

export function listAdminIncentives(page = 1, pageSize = 20, status?: string) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (status) params.append("status", status);
  return apiClient.get<IncentiveListResponse>(`/admin/incentives?${params}`);
}

export function getAdminIncentive(id: string) {
  return apiClient.get<any>(`/admin/incentives/${id}`);
}

export function createAdminIncentive(data: {
  name: string;
  description: string;
  promotion?: string;
  imageUrl?: string;
  publicId?: string;
  pointsRequired: number;
  stock: number;
}) {
  return apiClient.post<any>("/admin/incentives", data);
}

export function updateAdminIncentive(
  id: string,
  data: {
    name?: string;
    description?: string;
    promotion?: string;
    imageUrl?: string;
    publicId?: string;
    pointsRequired?: number;
    stock?: number;
  },
) {
  return apiClient.patch<any>(`/admin/incentives/${id}`, data);
}

export function updateAdminIncentiveStatus(id: string, status: "ACTIVE" | "INACTIVE") {
  return apiClient.patch<any>(`/admin/incentives/${id}/status`, { status });
}

export function deleteAdminIncentive(id: string) {
  return apiClient.delete<any>(`/admin/incentives/${id}`);
}

export function listAdminRedemptions(
  page = 1,
  pageSize = 20,
  status?: string,
  minPoints?: number,
  maxPoints?: number,
) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (status) params.append("status", status);
  if (minPoints !== undefined) params.append("minPoints", String(minPoints));
  if (maxPoints !== undefined) params.append("maxPoints", String(maxPoints));
  return apiClient.get<RedemptionListResponse>(`/admin/redemptions?${params}`);
}

export function getAdminRedemption(id: string) {
  return apiClient.get<any>(`/admin/redemptions/${id}`);
}

export function approveAdminRedemption(id: string) {
  return apiClient.patch<any>(`/admin/redemptions/${id}/approve`, {});
}

export function rejectAdminRedemption(id: string, reason?: string) {
  return apiClient.patch<any>(`/admin/redemptions/${id}/reject`, { reason });
}

export function deliverAdminRedemption(id: string) {
  return apiClient.patch<any>(`/admin/redemptions/${id}/deliver`, {});
}
