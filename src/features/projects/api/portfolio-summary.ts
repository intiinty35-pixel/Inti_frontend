import { backendFetch } from '@/shared/lib/api/server';
import type { ProjectApiDetail, ProjectApiPaged } from '../types/api';
import type { PlanSession } from '@/shared/lib/site-plan';
import type { PortfolioSummary } from '../components/admin-portfolio-summary';

async function read<T>(path: string): Promise<T> {
  const response = await backendFetch(path);
  if (!response.ok) throw new Error(`No se pudo consultar el inventario (${response.status}).`);
  return await response.json() as T;
}

export async function loadPortfolioSummary(currentPage: ProjectApiPaged): Promise<PortfolioSummary> {
  const response = await backendFetch('/admin/projects/portfolio-summary');
  if (response.ok) return await response.json() as PortfolioSummary;
  // Older servers do not expose this route, or treat its name as a project UUID.
  if (![400, 404].includes(response.status)) throw new Error(`No se pudo cargar el resumen (${response.status}).`);
  const projects = [...currentPage.items];
  const pages = Math.ceil(currentPage.total / currentPage.pageSize);
  const missing = Array.from({ length: pages }, (_, index) => index + 1).filter(page => page !== currentPage.page);
  for (let offset = 0; offset < missing.length; offset += 4) {
    const results = await Promise.all(missing.slice(offset, offset + 4).map(page => read<ProjectApiPaged>(`/admin/projects/all?page=${page}&pageSize=${currentPage.pageSize}`)));
    projects.push(...results.flatMap(result => result.items));
  }
  const uniqueProjects = [...new Map(projects.map(project => [project.id, project])).values()];
  if (uniqueProjects.length !== currentPage.total) throw new Error('El inventario cambió durante la consulta. Vuelve a intentarlo.');
  const summary: PortfolioSummary = { projects: uniqueProjects.length, totalLots: 0, available: 0, reserved: 0, sold: 0, blocked: 0, availableProjects: 0, reservedProjects: 0, soldProjects: 0 };
  for (let offset = 0; offset < uniqueProjects.length; offset += 4) {
    const inventory = await Promise.all(uniqueProjects.slice(offset, offset + 4).map(async project => {
      const session = await read<PlanSession>(`/admin/projects/${encodeURIComponent(project.id)}/site-plan`);
      const lots = session.revision > 0 || session.plan.lots.length ? session.plan.lots : (await read<ProjectApiDetail>(`/admin/projects/${encodeURIComponent(project.id)}`)).lots;
      return { project, lots };
    }));
    for (const { project, lots } of inventory) {
      const statuses = lots.map(lot => lot.status);
      summary.totalLots += lots.length;
      summary.available += statuses.filter(status => status === 'AVAILABLE').length;
      summary.reserved += statuses.filter(status => status === 'RESERVED').length;
      summary.sold += statuses.filter(status => status === 'SOLD').length;
      summary.blocked += statuses.filter(status => status === 'BLOCKED').length;
      if (statuses.includes('AVAILABLE')) summary.availableProjects++;
      if (statuses.includes('RESERVED')) summary.reservedProjects++;
      if (project.status === 'SOLD' || (lots.length > 0 && statuses.every(status => status === 'SOLD'))) summary.soldProjects++;
    }
  }
  return summary;
}
