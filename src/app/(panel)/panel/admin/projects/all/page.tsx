import { AdminProjectCatalog } from "@/features/projects/components/admin-project-catalog";
import { Suspense } from "react";
import { loadPortfolioSummary } from "@/features/projects/api/portfolio-summary";
import Link from "next/link";
import { getAdminAllProjectsPagedServer } from "@/features/projects/api/server";
import { PROJECT_STATUS_LABELS, type ApiProjectStatus, type ProjectApiPaged } from "@/features/projects/types/api";
import { ROUTES } from "@/shared/config/routes";

import { Pagination } from "@/shared/ui/pagination";
import { AdminPortfolioSummary } from "@/features/projects/components/admin-portfolio-summary";

async function PortfolioOverview({ data, filtered }: { data: ProjectApiPaged; filtered: boolean }) {
  const summary = await (async () => {
    const inventory = filtered ? await getAdminAllProjectsPagedServer(1, undefined, 20) : data;
    return loadPortfolioSummary(inventory);
  })().catch(() => null);
  return <AdminPortfolioSummary summary={summary} />;
}

export default async function AllProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Math.floor(Number(params.page) || 1));
  const status = params.status && Object.hasOwn(PROJECT_STATUS_LABELS, params.status)
    ? params.status as ApiProjectStatus : undefined;
  const data = await getAdminAllProjectsPagedServer(page, status, 20);
  const filters: { label: string; status?: ApiProjectStatus }[] = [
    { label: "Todos" },
    ...Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => ({ label, status: value as ApiProjectStatus })),
  ];
  return (
    <div className="grid min-w-0 max-w-full gap-6">
      <Suspense fallback={<p role="status" className="rounded-2xl border border-edge bg-surface p-5 text-sm text-muted">Cargando resumen del inventario…</p>}>
        <PortfolioOverview data={data} filtered={!!status} />
      </Suspense>
      <nav aria-label="Filtrar proyectos por estado" className="flex max-w-full gap-2 overflow-x-auto rounded-card bg-surface-muted/70 p-1.5">
        {filters.map(filter => (
          <Link
            key={filter.status ?? "all"}
            href={filter.status ? `${ROUTES.panel.admin.allProjects}?status=${filter.status}` : ROUTES.panel.admin.allProjects}
            aria-current={filter.status === status ? "page" : undefined}
            className={`whitespace-nowrap rounded-card px-4 py-2.5 text-sm font-bold transition-colors ${filter.status === status ? "bg-surface text-brand shadow-sm ring-1 ring-accent" : "text-muted hover:bg-surface/70 hover:text-brand"}`}
          >
            {filter.label}
          </Link>
        ))}
      </nav>
      <AdminProjectCatalog projects={data.items} />
      <Pagination
        page={data.page}
        pageSize={data.pageSize}
        total={data.total}
        buildHref={(n) => `${ROUTES.panel.admin.allProjects}?page=${n}${status ? `&status=${status}` : ""}`}
      />
    </div>
  );
}
