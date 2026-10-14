import { backendFetch } from '@/shared/lib/api/server';

export type ReferralStatus = 'CONTACTED' | 'VISIT' | 'OPERATION_COMPLETED';

export interface ProjectPointsConfig {
  CONTACTED: number;
  VISIT: number;
  OPERATION_COMPLETED: number;
}

export interface AdminProjectWithPoints {
  id: string;
  name: string;
  slug: string;
  points: ProjectPointsConfig;
}

export async function listAdminProjectPoints(): Promise<AdminProjectWithPoints[]> {
  const response = await backendFetch('/admin/campaigns/project-points');
  if (!response.ok) throw new Error('No se pudieron cargar los puntos por proyecto Ariz.');
  return response.json() as Promise<AdminProjectWithPoints[]>;
}
