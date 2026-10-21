import Link from "next/link";
import { backendFetch } from "@/shared/lib/api/server";
import type { ProjectApiPaged } from "@/features/projects/types/api";
import { PROJECT_STATUS_LABELS } from "@/features/projects/types/api";
import { Pagination } from "@/shared/ui/pagination";

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
      <header className="rounded-2xl border border-edge bg-surface p-6">
        <h1 className="text-2xl font-black text-brand">Todos los proyectos</h1>
        <p className="mt-2 text-sm text-muted">
          {data.total} proyectos. Administra el plano, la base de lotes y las
          condiciones de venta de cada proyecto.
        </p>
      </header>
      <div className="overflow-auto rounded-2xl border border-edge bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted">
            <tr>
              <th className="p-4">Proyecto</th>
              <th className="p-4">Origen</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Lotes</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((project) => (
              <tr className="border-t border-edge" key={project.id}>
                <td className="p-4 font-bold">
                  {project.name}
                  <p className="text-xs font-normal text-muted">
                    {project.location?.district}
                  </p>
                </td>
                <td className="p-4">
                  {project.origin === "ADMIN" ? "ARIZ" : "Desarrollador"}
                </td>
                <td className="p-4">{PROJECT_STATUS_LABELS[project.status]}</td>
                <td className="p-4">{project.lotsCount}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white"
                      href={`/panel/admin/projects/${project.id}/site-plan`}
                    >
                      Editar plano y lotes
                    </Link>
                    <Link
                      className="rounded-xl border border-edge px-4 py-2"
                      href={`/panel/admin/projects/${project.id}/edit`}
                    >
                      Editar proyecto
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data.items.length && (
          <p className="p-6 text-muted">
            Todavía no hay proyectos registrados.
          </p>
        )}
      </div>
      <Pagination
        page={data.page}
        pageSize={data.pageSize}
        total={data.total}
        buildHref={(n) => `/panel/admin/projects/all?page=${n}`}
      />
    </div>
  );
}
