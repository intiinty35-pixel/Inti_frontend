import Link from "next/link";
import { LayoutGrid, Plus, Sparkles } from "lucide-react";
import { Pagination } from "@/shared/ui/pagination";
import { ROUTES } from "@/shared/config/routes";
import { OwnerProjectCard } from "@/features/projects/components/owner-project-card";
import { getAdminProjectsPagedServer } from "@/features/projects/api/server";

const PAGE_SIZE = 6;

function ProjectMetric({
  label,
  value,
  caption,
}: {
  label: string;
  value: string | number;
  caption: string;
}) {
  return (
    <div className="min-w-0 rounded-card border border-edge bg-surface px-2 py-3 text-center shadow-[var(--shadow-card)] sm:px-5 sm:py-4">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted sm:text-xs sm:tracking-[0.18em]">{label}</p>
      <p className="mt-1 font-display text-2xl font-black text-brand sm:mt-2">{value}</p>
      <p className="mt-1 text-[10px] font-semibold leading-tight text-muted sm:text-xs">{caption}</p>
    </div>
  );
}

export async function AdminProjectList({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const requestedPage = Number(pageParam);
  let page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  let data = await getAdminProjectsPagedServer(page, undefined, PAGE_SIZE);
  const lastPage = Math.max(1, Math.ceil(data.total / data.pageSize));

  if (page > lastPage) {
    page = lastPage;
    data = await getAdminProjectsPagedServer(page, undefined, PAGE_SIZE);
  }

  const { items, total, pageSize } = data;

  return (
    <div className="flex min-w-0 max-w-full flex-col gap-6 overflow-x-hidden">
      <section className="rounded-card border border-edge bg-surface px-5 py-4 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
              Publicaciones de ARIZ
            </p>
            <h1 className="mt-1 font-display text-2xl font-black text-brand sm:text-3xl">
              Proyectos ARIZ
            </h1>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-5 text-muted">
              {total} {total === 1 ? "proyecto administrado" : "proyectos administrados"}. Gestiona
              borradores y publicados sin consumir creditos.
            </p>
          </div>
        <Link
          href={ROUTES.panel.admin.newProject}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-card bg-brand px-4 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
        >
          <Plus className="size-4" />
          Crear proyecto
        </Link>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2 sm:gap-4">
        <ProjectMetric
          label="Total"
          value={total}
          caption={total === 1 ? "Proyecto registrado" : "Proyectos registrados"}
        />
        <ProjectMetric
          label="Visibles"
          value={items.length}
          caption="Mostrados en esta pagina"
        />
        <ProjectMetric label="Pagina" value={page} caption={`Hasta ${pageSize} por pagina`} />
      </section>

      {items.length > 0 ? (
        <>
          <div className="grid min-w-0 max-w-full gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((project) => (
              <OwnerProjectCard key={project.id} project={project} adminMode />
            ))}
          </div>
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            buildHref={(next) => `${ROUTES.panel.admin.projects}?page=${next}`}
          />
        </>
      ) : (
        <div className="rounded-card border border-dashed border-edge bg-surface p-8 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto flex size-11 items-center justify-center rounded-card bg-brand/10 text-brand">
            <Sparkles className="size-5" />
          </div>
          <p className="mt-4 font-display text-xl font-black text-brand">
            Aun no hay proyectos de ARIZ
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Crea un proyecto desde el panel. Aparecera aqui como borrador y podras
            publicarlo sin consumir creditos.
          </p>
          <Link
            href={ROUTES.panel.admin.newProject}
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-card bg-brand px-5 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
          >
            <LayoutGrid className="size-4" />
            Crear proyecto ARIZ
          </Link>
        </div>
      )}
    </div>
  );
}
