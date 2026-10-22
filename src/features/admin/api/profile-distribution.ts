import { backendFetch } from '@/shared/lib/api/server';
import { countProfessionalProfiles, type Distribution } from '../lib/profile-distribution';

export async function loadProfileDistribution(): Promise<{ data?: Distribution; status: number }> {
  const response = await backendFetch('/admin/professionals');
  if (!response.ok) return { status: response.status };
  return { status: 200, data: countProfessionalProfiles(await response.json()) };
}
