import { apiClient } from '@/shared/lib/api/client';
import type {
  Campaign,
  CreateCampaignInput,
  UpdateCampaignInput,
} from './campaigns-types';

export async function createCampaign(input: CreateCampaignInput): Promise<Campaign> {
  const response = await apiClient.post<Campaign>('/admin/campaigns', input);
  return response;
}

export async function updateCampaign(id: string, input: UpdateCampaignInput): Promise<Campaign> {
  const response = await apiClient.patch<Campaign>(`/admin/campaigns/${encodeURIComponent(id)}`, input);
  return response;
}

export async function deleteCampaign(id: string): Promise<void> {
  await apiClient.delete(`/admin/campaigns/${encodeURIComponent(id)}`);
}

export async function listArizProjects(): Promise<Array<{ id: string; name: string }>> {
  const response = await apiClient.get<{ items: Array<{ id: string; name: string }> }>(
    '/admin/projects?pageSize=200'
  );
  return response.items.map((p) => ({ id: p.id, name: p.name }));
}

export type { Campaign, CreateCampaignInput, UpdateCampaignInput, CampaignPoints } from './campaigns-types';
