import { apiClient } from '@/shared/lib/api/client';

export type ClaimType = 'Claim' | 'Complaint';

export interface ClaimInput {
  fullName: string;
  address: string;
  dniOrCe: string;
  phone?: string;
  email: string;
  parentGuardian?: string;
  assetType: string;
  claimedAmount: number;
  assetDescription: string;
  type: ClaimType;
  claimDetails: string;
  consumerRequest: string;
}

export interface ClaimResponse {
  id: string;
  claimCode: string;
  fullName: string;
  address: string;
  dniOrCe: string;
  phone: string | null;
  email: string;
  parentGuardian: string | null;
  assetType: string;
  claimedAmount: number;
  assetDescription: string;
  type: ClaimType;
  claimDetails: string;
  consumerRequest: string;
  createdAt: string;
}

export interface AdminClaimListItem {
  id: string;
  claimCode: string;
  fullName: string;
  type: ClaimType;
  assetType: string;
  createdAt: string;
}

export interface AdminClaimsPage {
  items: AdminClaimListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export function submitPublicClaim(input: ClaimInput) {
  return apiClient.post<ClaimResponse>('/claims', input);
}
