import Link from "next/link";
import { LayoutGrid, Map as MapIcon, Sparkles } from "lucide-react";
import { Pagination } from "@/shared/ui/pagination";
import { ROUTES } from "@/shared/config/routes";
import { CheckCircleIcon } from "@/shared/ui/icons";
import { getAdminAllProjectsPagedServer } from "@/features/projects/api/server";
import { AdminAllProjectCard } from "@/features/projects/components/admin-all-project-card";
import {
  PROJECT_STATUS_LABELS,
  type ApiProjectStatus,
} from "@/features/projects/types/api";

const PAGE_SIZE = 12;

const STATUS_FILTERS: { label: string; status?: ApiProjectStatus }[] = [
  { label: "Todos" },
  { label: "Publicados", status: "PUBLISHED" },
  { label: "En revisión", status: "PENDING_REVIEW" },
  { label: "Borradores", status: "DRAFT" },
  { label: "Pausados", status: "PAUSED" },
  { label: "Vendidos", status: "SOLD" },
  { label: "Rechazados", status: "REJECTED" },
  { label: "Archivados", status: "ARCHIVED" },
];

/** El backend solo acepta un estado del catalogo; cualquier otro valor se ignora. */
function parseStatus(value: string | undefined): ApiProjectStatus | undefined {
  return value && value in PROJECT_STATUS_LABELS ? (value as ApiProjectStatus) : undefined;
}

function MetricCard({
  label,
  value,
  caption,
  tone,
  Icon,
}: {
  label: string;
  value: number;
  caption: string;
  tone: string;
  Icon: typeof MapIcon;
}) {
  return (
    <div className="rounded-card border border-edge bg-surface px-5 py-4 text-center shadow-[var(--shadow-card)]">
      <span className={`mx-auto flex size-9 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-black text-brand">
        {value.toLocaleString("es-PE")}
      </p>
      <p className="mt-1 text-xs font-semibold text-muted">{caption}</p>
    </div>
  );
}

export default async function AllProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Math.floor(Number(params.page) || 1));
  const status = parseStatus(params.status);
  const data = await getAdminAllProjectsPagedServer(page, status, PAGE_SIZE);

  const arizCount = data.items.filter((project) => project.origin === "ADMIN").length;
  const externalCount = data.items.length - arizCount;
  const publishedCount = data.items.filter((project) => project.status === "PUBLISHED").length;

  return (
    <div className="flex min-w-0 max-w-full flex-col gap-6 overflow-x-hidden">
      <section className="rounded-card border border-edge bg-surface px-5 py-4 shadow-[var(--shadow-card)]">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">Portafolio</p>
        <h1 className="mt-1 font-display text-2xl font-black text-brand sm:text-3xl">
          Todos los proyectos
        </h1>
        <p className="mt-1 max-w-3xl text-sm font-semibold leading-5 text-muted">
          {data.total.toLocaleString("es-PE")}{" "}
          {data.total === 1 ? "proyecto" : "proyectos"} entre ARIZ y los desarrolladores
          registrados. Administra el plano, la base de lotes y las condiciones de venta de
          cada proyecto.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total"
          value={data.total}
          caption={
            status
              ? `Proyectos ${PROJECT_STATUS_LABELS[status].toLowerCase()}`
              : "Proyectos registrados en el portafolio"
          }
          tone="bg-brand-soft text-brand"
          Icon={MapIcon}
        />
        <MetricCard
          label="De ARIZ"
          value={arizCount}
          caption="Proyectos de ARIZ en esta página"
          tone="bg-accent/15 text-accent"
          Icon={Sparkles}
        />
        <MetricCard
          label="De desarrolladores"
          value={externalCount}
          caption="Proyectos de terceros en esta página"
          tone="bg-surface-muted text-ink"
          Icon={LayoutGrid}
        />
        <MetricCard
          label="Publicados"
          value={publishedCount}
          caption="Visibles en el sitio en esta página"
          tone="bg-success/10 text-success"
          Icon={CheckCircleIcon}
        />
      </section>

      <div className="flex w-fit max-w-full gap-2 overflow-x-auto rounded-card bg-surface-muted/70 p-1.5">
        {STATUS_FILTERS.map((filter) => {
          const active = filter.status === status;
          const href = filter.status
            ? `${ROUTES.panel.admin.allProjects}?status=${filter.status}`
            : ROUTES.panel.admin.allProjects;

          return (
            <Link
              key={filter.label}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`whitespace-nowrap rounded-card px-4 py-2.5 text-sm font-bold transition-colors ${
                active
                  ? "bg-surface text-brand shadow-sm ring-1 ring-accent"
                  : "text-muted hover:bg-surface/70 hover:text-brand"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {data.items.length > 0 ? (
        <>
          <div className="grid min-w-0 max-w-full gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {data.items.map((project) => (
              <AdminAllProjectCard key={project.id} project={project} />
            ))}
          </div>
          <Pagination
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            buildHref={(next) =>
              `${ROUTES.panel.admin.allProjects}?page=${next}${status ? `&status=${status}` : ""}`
            }
          />
        </>
      ) : (
        <div className="rounded-card border border-dashed border-edge bg-surface p-8 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto flex size-11 items-center justify-center rounded-card bg-brand/10 text-brand">
            <LayoutGrid className="size-5" />
          </div>
          <p className="mt-4 font-display text-xl font-black text-brand">
            Aun no hay proyectos
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            {status
              ? "No hay proyectos que coincidan con el filtro seleccionado."
              : "Todavía no hay proyectos registrados en el portafolio."}
          </p>
        </div>
      )}
    </div>
  );
}
