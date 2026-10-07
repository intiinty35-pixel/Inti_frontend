import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  Mail,
  MapPin,
  MessageCircle,
  XCircle,
} from "lucide-react";
import { Card, CardContent, Pagination } from "@/shared/ui";
import { listDevelopers, type DeveloperReviewStatus } from "@/features/admin/api/server";
import { ROUTES } from "@/shared/config/routes";

const REVIEW_TABS: Array<{
  label: string;
  status: DeveloperReviewStatus;
  href: string;
  Icon: typeof ClipboardList;
}> = [
  {
    label: "Pendientes",
    status: "PENDING_REVIEW",
    href: ROUTES.panel.admin.developers,
    Icon: ClipboardList,
  },
  {
    label: "Rechazadas",
    status: "REJECTED",
    href: `${ROUTES.panel.admin.developers}?status=REJECTED`,
    Icon: XCircle,
  },
];

export default async function AdminDevelopersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const status: DeveloperReviewStatus =
    params.status === "REJECTED" ? "REJECTED" : "PENDING_REVIEW";
  const { items, total, pageSize } = await listDevelopers(status, page, 12);
  const pageProperties = items.reduce((sum, developer) => sum + (developer.properties?.length ?? 0), 0);
  const pageProjects = items.reduce((sum, developer) => sum + (developer.projects?.length ?? 0), 0);
  const pageTotal = pageProperties + pageProjects;
  const isRejected = status === "REJECTED";

  return (
    <div className="flex flex-col gap-7">
      <section className="relative overflow-hidden rounded-card border border-edge bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className={`absolute inset-x-0 top-0 h-1.5 ${isRejected ? "bg-error" : "bg-brand"}`} aria-hidden="true" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-accent">
              {isRejected ? "Historial de rechazos" : "Cola de revisión"}
            </p>
            <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-brand sm:text-4xl">
              {isRejected ? "Fichas rechazadas de desarrolladores" : "Desarrolladores con contenido pendiente"}
            </h2>
            <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-muted">
              {isRejected
                ? "Consulta las fichas rechazadas para auditar decisiones o volver a revisar el contenido."
                : "Revisa propiedades y proyectos enviados por desarrolladores antes de publicarlos en el portal."}
            </p>
          </div>

          <div className="rounded-card border border-brand/15 bg-brand-soft p-4 text-center">
            <div className="flex flex-col items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand text-on-brand">
                {isRejected ? (
                  <XCircle className="size-5" aria-hidden="true" />
                ) : (
                  <ClipboardList className="size-5" aria-hidden="true" />
                )}
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-brand">
                  Fichas en esta página
                </p>
                <p className="mt-1 font-display text-3xl font-black text-brand">
                  {pageTotal.toLocaleString("es-PE")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Desarrolladores"
          value={total}
          hint={isRejected ? "Perfiles con fichas rechazadas." : "Perfiles con fichas pendientes."}
          tone="bg-brand-soft text-brand"
          Icon={Building2}
        />
        <StatCard
          label="Propiedades"
          value={pageProperties}
          hint="Propiedades visibles en esta página."
          tone="bg-success/10 text-success"
          Icon={CheckCircle2}
        />
        <StatCard
          label="Proyectos"
          value={pageProjects}
          hint="Proyectos ligados a desarrolladores."
          tone="bg-accent/15 text-accent"
          Icon={FolderKanban}
        />
      </section>

      <div className="flex w-fit max-w-full gap-2 overflow-x-auto rounded-card bg-surface-muted/70 p-1.5">
        {REVIEW_TABS.map((tab) => {
          const active = tab.status === status;
          const Icon = tab.Icon;
          return (
            <Link
              key={tab.status}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2.5 whitespace-nowrap rounded-card px-4 py-2.5 text-sm font-bold transition-colors ${
                active
                  ? "bg-surface text-brand shadow-sm ring-1 ring-edge"
                  : "text-muted hover:bg-surface/70 hover:text-brand"
              }`}
            >
              <Icon className="size-4 text-accent" aria-hidden="true" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <Building2 className="size-7" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-black text-brand">
              {isRejected ? "No hay desarrolladores rechazados" : "No hay desarrolladores en revisión"}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted">
              {isRejected
                ? "Cuando rechaces fichas de desarrolladores, aparecerán en esta cola."
                : "Cuando un desarrollador envíe contenido para aprobar, aparecerá aquí."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.map((developer) => {
            const name = (
              developer.businessName ??
              `${developer.user.firstName} ${developer.user.lastName ?? ""}`
            ).trim();
            const properties = developer.properties?.length ?? 0;
            const projects = developer.projects?.length ?? 0;
            const totalItems = properties + projects;

            return (
              <Card
                key={developer.id}
                className="group flex min-h-[250px] flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]"
              >
                <div className={isRejected ? "h-1.5 bg-error" : "h-1.5 bg-brand"} aria-hidden="true" />
                <CardContent className="flex flex-1 flex-col p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                      <Building2 className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-accent">
                        Desarrollador
                      </p>
                      <h3 className="mt-1 line-clamp-2 font-display text-lg font-black leading-tight text-brand">
                        {name}
                      </h3>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black ${
                        isRejected
                          ? "bg-error/10 text-error"
                          : "bg-warning/15 text-warning"
                      }`}
                    >
                      {isRejected ? "Rechazada" : "En cola"}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 text-xs">
                    <p className="flex min-w-0 items-center gap-2 text-muted">
                      <MapPin className="size-4 shrink-0 text-accent" aria-hidden="true" />
                      <span className="truncate">{developer.city || "Ciudad no registrada"}</span>
                    </p>
                    <p className="flex min-w-0 items-center gap-2 text-muted">
                      <Mail className="size-4 shrink-0 text-accent" aria-hidden="true" />
                      <span className="truncate">{developer.user.email}</span>
                    </p>
                    {developer.whatsapp ? (
                      <p className="flex min-w-0 items-center gap-2 text-muted">
                        <MessageCircle className="size-4 shrink-0 text-success" aria-hidden="true" />
                        <span className="truncate">{developer.whatsapp}</span>
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2 border-y border-edge py-3 text-center">
                    <Metric label="Total" value={totalItems} />
                    <Metric label="Props." value={properties} />
                    <Metric label="Proy." value={projects} />
                  </div>

                  <div className="mt-auto pt-4">
                    <Link
                      href={`${ROUTES.panel.admin.developer(developer.id)}?status=${status}`}
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-card bg-accent px-3 text-xs font-black text-on-accent transition-colors hover:bg-accent-hover"
                    >
                      Revisar fichas
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        buildHref={(next) => `${ROUTES.panel.admin.developers}?status=${status}&page=${next}`}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  tone,
  Icon,
}: {
  label: string;
  value: number;
  hint: string;
  tone: string;
  Icon: typeof Building2;
}) {
  return (
    <Card className="p-4 text-center">
      <div className="flex items-center justify-center gap-3">
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted">{label}</p>
          <p className="mt-1 font-display text-3xl font-black tracking-tight text-brand">
            {value.toLocaleString("es-PE")}
          </p>
        </div>
      </div>
      <p className="mx-auto mt-2 max-w-56 text-xs font-semibold leading-5 text-muted">{hint}</p>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-brand">{value}</p>
    </div>
  );
}
