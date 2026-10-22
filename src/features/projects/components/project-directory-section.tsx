import { getPublicProjectsServer } from '../api/server';
import { ProjectDirectory } from './project-directory';
import type { ProjectApiSummary } from '../types/api';

export async function ProjectDirectorySection() {
  const projects: ProjectApiSummary[] = [];
  let loadError = false;
  try {
    const first = await getPublicProjectsServer(50, undefined, 'recent', 1);
    projects.push(...first.items);
    const pages = Math.ceil(first.total / first.pageSize);
    for (let start = 2; start <= pages; start += 4) {
      const results = await Promise.all(Array.from({ length: Math.min(4, pages - start + 1) }, (_, offset) => getPublicProjectsServer(50, undefined, 'recent', start + offset)));
      projects.push(...results.flatMap(result => result.items));
    }
  } catch { loadError = true; }
  return <ProjectDirectory projects={[...new Map(projects.map(project => [project.id, project])).values()]} loadError={loadError} />;
}
