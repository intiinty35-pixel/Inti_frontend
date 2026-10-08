import { backendFetch } from '@/shared/lib/api/server';
import type { ClaimResponse, ClaimType } from './client';

export type { ClaimType };

export interface AdminClaim {
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

export async function listAdminClaims(page = 1, pageSize = 20): Promise<AdminClaimsPage> {
  const response = await backendFetch(`/admin/claims?page=${page}&pageSize=${pageSize}`);
  if (!response.ok) throw new Error(`Failed to load claims (${response.status})`);
  return (await response.json()) as AdminClaimsPage;
}

export async function getAdminClaim(id: string): Promise<AdminClaim> {
  const response = await backendFetch(`/admin/claims/${encodeURIComponent(id)}`);
  if (!response.ok) throw new Error(`Failed to load claim (${response.status})`);
  return (await response.json()) as AdminClaim;
}

export async function deleteClaim(id: string): Promise<void> {
  const response = await backendFetch(`/admin/claims/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error(`Failed to delete claim (${response.status})`);
}
