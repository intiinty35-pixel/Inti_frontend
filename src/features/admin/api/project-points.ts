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
  try {
    const response = await backendFetch('/admin/projects?pageSize=200');
    if (!response.ok) {
      return [];
    }
    const data = (await response.json()) as {
      items: Array<{ id: string; name: string; slug: string }>;
    };
    return data.items.map((project) => ({
      id: project.id,
      name: project.name,
      slug: project.slug,
      points: { CONTACTED: 0, VISIT: 0, OPERATION_COMPLETED: 0 },
    }));
  } catch {
    return [];
  }
}
