import Link from "next/link";
import { PlusIcon } from "@/shared/ui";
import { Pagination } from "@/shared/ui/pagination";
import { ROUTES } from "@/shared/config/routes";
import { OwnerProjectCard } from "@/features/projects/components/owner-project-card";
import { getAdminProjectsPagedServer } from "@/features/projects/api/server";
import { AdminPageHeader } from "@/app/(panel)/panel/admin/admin-shell";

export async function AdminProjectList({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { items, total, pageSize } = await getAdminProjectsPagedServer(page);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <AdminPageHeader
          eyebrow="Publicaciones de ARIZ"
          title="Proyectos ARIZ"
          description={`${total} ${total === 1 ? "proyecto administrado" : "proyectos administrados"}. Los borradores y publicados se gestionan aquí; publicar no consume créditos.`}
        />
        <Link
          href={ROUTES.panel.admin.newProject}
          className="mb-6 inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-card bg-brand px-5 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover sm:mb-0"
        >
          <PlusIcon className="size-4" />
          Crear proyecto
        </Link>
      </div>

      {items.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
        <div className="rounded-card border border-dashed border-edge bg-surface p-10 text-center shadow-[var(--shadow-card)]">
          <p className="font-display text-xl font-black text-brand">
            Aún no hay proyectos de ARIZ
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Crea un proyecto desde el panel. Aparecerá aquí como borrador y podrás publicarlo sin consumir créditos.
          </p>
          <Link
            href={ROUTES.panel.admin.newProject}
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-card bg-brand px-5 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
          >
            <PlusIcon className="size-4" />
            Crear proyecto ARIZ
          </Link>
        </div>
      )}
    </div>
  );
}
