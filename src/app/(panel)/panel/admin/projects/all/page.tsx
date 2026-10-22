import { AdminProjectCatalog } from "@/features/projects/components/admin-project-catalog";
import { Suspense } from "react";
import { loadPortfolioSummary } from "@/features/projects/api/portfolio-summary";
import { backendFetch } from "@/shared/lib/api/server";
import type { ProjectApiPaged } from "@/features/projects/types/api";

import { Pagination } from "@/shared/ui/pagination";
import { AdminPortfolioSummary } from "@/features/projects/components/admin-portfolio-summary";

async function PortfolioOverview({ data }: { data: ProjectApiPaged }) {
  const summary = await loadPortfolioSummary(data).catch(() => null);
  return <AdminPortfolioSummary summary={summary} />;
}

export default async function AllProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Math.floor(Number(params.page) || 1));
  const response = await backendFetch(
    `/admin/projects/all?page=${page}&pageSize=20`,
  );
  if (!response.ok) throw new Error("No se pudieron cargar los proyectos.");
  const data = (await response.json()) as ProjectApiPaged;
  return (
    <div className="grid gap-6">
      <Suspense fallback={<p role="status" className="rounded-2xl border border-edge bg-surface p-5 text-sm text-muted">Cargando resumen del inventario…</p>}>
        <PortfolioOverview data={data} />
      </Suspense>
      <AdminProjectCatalog projects={data.items} />
      <Pagination
        page={data.page}
        pageSize={data.pageSize}
        total={data.total}
        buildHref={(n) => `/panel/admin/projects/all?page=${n}`}
      />
    </div>
  );
}
