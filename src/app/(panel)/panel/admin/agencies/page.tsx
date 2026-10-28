import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  ClipboardList,
  FolderKanban,
  Mail,
  MapPin,
  MessageCircle,
  PanelsTopLeft,
} from "lucide-react";
import { Card, CardContent, Pagination } from "@/shared/ui";
import { listAgencies } from "@/features/admin/api/server";
import { ROUTES } from "@/shared/config/routes";

type AgencySummary = Awaited<ReturnType<typeof listAgencies>>["items"][number];

function displayAgencyName(agency: AgencySummary) {
  return (
    agency.businessName ??
    `${agency.user.firstName} ${agency.user.lastName ?? ""}`
  ).trim();
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
    <Card className="min-h-36 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted">{label}</p>
          <p className="mt-3 font-display text-4xl font-black tracking-tight text-brand">
            {value.toLocaleString("es-PE")}
          </p>
        </div>
        <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-xs font-semibold leading-5 text-muted">{hint}</p>
    </Card>
  );
}

export default async function AdminAgenciesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { items, total, pageSize } = await listAgencies(page, 12);
  const pendingProperties = items.reduce((sum, agency) => sum + agency.properties.length, 0);
  const pendingProjects = items.reduce((sum, agency) => sum + agency.projects.length, 0);
  const pagePendingTotal = pendingProperties + pendingProjects;

  return (
    <div className="flex flex-col gap-7">
      <section className="relative overflow-hidden rounded-card border border-edge bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-brand" aria-hidden="true" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-accent">
              Cola de revisión
            </p>
            <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-brand sm:text-4xl">
              Inmobiliarias con contenido pendiente
            </h2>
            <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-muted">
              Esta vista reúne las cuentas que tienen propiedades o proyectos esperando aprobación.
              Entra a cada perfil para revisar detalle, publicar o rechazar.
            </p>
          </div>
          <div className="rounded-card border border-brand/15 bg-brand-soft p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand text-on-brand">
                <ClipboardList className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-brand">
                  Pendientes en esta página
                </p>
                <p className="mt-1 font-display text-3xl font-black text-brand">
                  {pagePendingTotal.toLocaleString("es-PE")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Inmobiliarias"
          value={total}
          hint="Cuentas con publicaciones en cola."
          tone="bg-brand-soft text-brand"
          Icon={Building2}
        />
        <StatCard
          label="Propiedades"
          value={pendingProperties}
          hint="Propiedades pendientes visibles en esta página."
          tone="bg-success/10 text-success"
          Icon={PanelsTopLeft}
        />
        <StatCard
          label="Proyectos"
          value={pendingProjects}
          hint="Proyectos enviados para revisión."
          tone="bg-accent/15 text-accent"
          Icon={FolderKanban}
        />
      </section>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <Building2 className="size-7" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-black text-brand">
              No hay inmobiliarias en revisión
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted">
              Cuando una inmobiliaria envíe propiedades o proyectos para aprobar, aparecerá aquí.
            </p>
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.map((agency) => {
            const name = displayAgencyName(agency);
            const pendingCount = agency.properties.length + agency.projects.length;

            return (
              <Card
                key={agency.id}
                className="group flex min-h-[250px] flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]"
              >
                <div className="h-1.5 bg-brand" aria-hidden="true" />
                <CardContent className="flex flex-1 flex-col p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                      <Building2 className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-accent">
                        Inmobiliaria
                      </p>
                      <h3 className="mt-1 line-clamp-2 font-display text-lg font-black leading-tight text-brand">
                        {name}
                      </h3>
                    </div>
                    <span className="shrink-0 rounded-full bg-warning/15 px-2.5 py-1 text-[11px] font-black text-warning">
                      En cola
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 text-xs">
                    <p className="flex min-w-0 items-center gap-2 text-muted">
                      <MapPin className="size-4 shrink-0 text-accent" aria-hidden="true" />
                      <span className="truncate">{agency.city || "Ciudad no registrada"}</span>
                    </p>
                    <p className="flex min-w-0 items-center gap-2 text-muted">
                      <Mail className="size-4 shrink-0 text-accent" aria-hidden="true" />
                      <span className="truncate">{agency.user.email}</span>
                    </p>
                    {agency.whatsapp ? (
                      <p className="flex min-w-0 items-center gap-2 text-muted">
                        <MessageCircle className="size-4 shrink-0 text-success" aria-hidden="true" />
                        <span className="truncate">{agency.whatsapp}</span>
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2 border-y border-edge py-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted">
                        Total
                      </p>
                      <p className="mt-1 text-lg font-black text-brand">{pendingCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted">
                        Props.
                      </p>
                      <p className="mt-1 text-lg font-black text-brand">{agency.properties.length}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted">
                        Proy.
                      </p>
                      <p className="mt-1 text-lg font-black text-brand">{agency.projects.length}</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-4">
                    <Link
                      href={ROUTES.panel.admin.agency(agency.id)}
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-card bg-accent px-3 text-xs font-black text-on-accent transition-colors hover:bg-accent-hover"
                    >
                      Revisar publicaciones
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
        buildHref={(next) => `${ROUTES.panel.admin.agencies}?page=${next}`}
      />
    </div>
  );
}
