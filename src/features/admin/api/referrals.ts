import { backendFetch } from '@/shared/lib/api/server';

export type ReferralStatus = 'CONTACTED' | 'VISIT' | 'OPERATION_COMPLETED';

export interface ReferralHistoryEntry {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  pointsAwarded: number;
  createdAt: string;
}

export interface AdminReferral {
  id: string;
  name: string;
  email: string;
  phone: string;
  code: string;
  status: ReferralStatus;
  interest: string;
  availability: string;
  points: number;
  createdAt: string;
  updatedAt: string;
  project: { id: string; name: string } | null;
  history: ReferralHistoryEntry[];
}

export interface AdminReferrer {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  totalPoints: number;
  referrals: AdminReferral[];
}

export interface ReferralStatusPoint {
  status: ReferralStatus;
  label: string;
  points: number;
}

export interface AdminReferralsPage {
  items: AdminReferrer[];
  total: number;
  page: number;
  pageSize: number;
  statusPoints: ReferralStatusPoint[];
}

export interface AdminReferralFilters {
  search?: string;
  from?: string;
  to?: string;
}

export async function listAdminReferrals(
  page = 1,
  pageSize = 20,
  filters: AdminReferralFilters = {},
): Promise<AdminReferralsPage> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (filters.search) params.set('search', filters.search);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  const response = await backendFetch(`/admin/referrals?${params.toString()}`);
  if (!response.ok) throw new Error(`No se pudieron cargar los referidos (${response.status})`);
  return (await response.json()) as AdminReferralsPage;
}

export async function getAdminReferrer(id: string): Promise<AdminReferrer> {
  const response = await backendFetch(`/admin/referrals/referrers/${encodeURIComponent(id)}`);
  if (!response.ok) throw new Error(`No se pudo cargar el referente (${response.status})`);
  return (await response.json()) as AdminReferrer;
}

export async function setReferralStatus(id: string, status: ReferralStatus) {
  const response = await backendFetch(`/admin/referrals/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error(`No se pudo actualizar el estado (${response.status})`);
}

export async function deleteAdminReferrer(id: string) {
  const response = await backendFetch(`/admin/referrals/referrers/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error(`No se pudo eliminar el referente (${response.status})`);
}
