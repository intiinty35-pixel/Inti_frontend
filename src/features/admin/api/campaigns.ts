import { backendFetch } from '@/shared/lib/api/server';
import type {
  Campaign,
  CampaignListResponse,
} from './campaigns-types';

export async function listAdminCampaignsServer(
  page = 1,
  pageSize = 20
): Promise<CampaignListResponse> {
  try {
    const response = await backendFetch(`/admin/campaigns?page=${page}&pageSize=${pageSize}`);
    if (!response.ok) {
      return { items: [], total: 0, page, pageSize };
    }
    return (await response.json()) as CampaignListResponse;
  } catch {
    return { items: [], total: 0, page, pageSize };
  }
}

export async function getAdminCampaignServer(id: string): Promise<Campaign | null> {
  try {
    const response = await backendFetch(`/admin/campaigns/${encodeURIComponent(id)}`);
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as Campaign;
  } catch {
    return null;
  }
}

export async function listArizProjectsServer(): Promise<Array<{ id: string; name: string }>> {
  try {
    const response = await backendFetch('/admin/campaigns/ariz-projects');
    if (!response.ok) {
      return [];
    }
    return (await response.json()) as Array<{ id: string; name: string }>;
  } catch {
    return [];
  }
}

export type { Campaign, CampaignListResponse } from './campaigns-types';
export type { CreateCampaignInput, UpdateCampaignInput, CampaignStatus, CampaignPoints } from './campaigns-types';
