import Link from "next/link";
import { Calendar, Edit, Plus, Settings2 } from "lucide-react";
import { Card, CardContent, Pagination } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { listAdminCampaignsServer, type CampaignStatus } from "@/features/admin/api/campaigns";
import { CopyCodeButton } from "./copy-code-button";
import { DeleteCampaignButton } from "./delete-campaign-button";

const STATUS_STYLES: Record<CampaignStatus, { bg: string; text: string; label: string }> = {
  ACTIVE: { bg: "bg-success/10", text: "text-success", label: "Activa" },
  INACTIVE: { bg: "bg-muted/20", text: "text-muted", label: "Inactiva" },
  EXPIRED: { bg: "bg-warning/10", text: "text-warning", label: "Expirada" },
};
const PAGE_SIZE = 12;

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function isDateInPast(dateStr: string) {
  return new Date(dateStr) < new Date();
}

export default async function AdminCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const requestedPage = Number(params.page);
  let page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  let result = await listAdminCampaignsServer(page, PAGE_SIZE);
  const lastPage = Math.max(1, Math.ceil(result.total / PAGE_SIZE));

  if (page > lastPage) {
    page = lastPage;
    result = await listAdminCampaignsServer(page, PAGE_SIZE);
  }

  const { items: campaigns, total } = result;

  const activeCampaigns = campaigns.filter((c) => {
    if (c.status === "ACTIVE") return true;
    if (c.status === "EXPIRED") return false;
    return !isDateInPast(c.endDate);
  });

  return (
    <div className="flex min-w-0 max-w-full flex-col gap-7 overflow-x-hidden">
      <section className="relative overflow-hidden rounded-card border border-edge bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-accent" aria-hidden="true" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-accent">
              ArizClub
            </p>
            <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-brand sm:text-5xl">
              Campañas
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-muted sm:text-base sm:mx-0">
              Gestiona campañas temporales con puntos independientes para proyectos INTI. Los
              puntos de campaña se cuentan aparte de los puntos normales de referidos.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Link
              href={ROUTES.panel.admin.campaignProjectPoints}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-card border border-edge bg-surface px-4 text-sm font-bold text-brand transition-colors hover:border-brand"
            >
              <Settings2 className="size-4" aria-hidden="true" />
              Puntos por proyecto
            </Link>
            <Link
              href={ROUTES.panel.admin.newCampaign}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-card bg-brand px-4 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
            >
              <Plus className="size-4" aria-hidden="true" />
              Nueva campaña
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2 sm:gap-4">
        <MetricCard
          label="Campañas totales"
          value={total}
          hint="Todas las campañas creadas."
          tone="bg-brand-soft text-brand"
          Icon={Calendar}
        />
        <MetricCard
          label="Campañas activas"
          value={activeCampaigns.length}
          hint="Activas en esta página."
          tone="bg-success/10 text-success"
          Icon={Calendar}
        />
        <MetricCard
          label="Proyectos cubiertos"
          value={new Set(campaigns.flatMap((c) => c.projectIds)).size}
          hint="Proyectos cubiertos en esta página."
          tone="bg-accent/15 text-accent"
          Icon={Calendar}
        />
      </section>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-accent/15 text-accent">
              <Calendar className="size-7" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-black text-brand">
              Aún no hay campañas creadas
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted">
              Crea tu primera campaña para definir puntos independientes por proyecto y estado de
              referido.
            </p>
            <Link
              href={ROUTES.panel.admin.newCampaign}
              className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-card bg-brand px-5 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
            >
              <Plus className="size-4" aria-hidden="true" />
              Crear campaña
            </Link>
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((campaign) => {
            const isExpired = isDateInPast(campaign.endDate);
            const displayStatus = isExpired ? "EXPIRED" : campaign.status;
            const displayStatusInfo = STATUS_STYLES[displayStatus];

            return (
              <Card
                key={campaign.id}
                className="flex h-full flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]"
              >
                <div
                  className={`h-1.5 ${displayStatusInfo.bg.replace("/10", "").replace("/20", "")}`}
                  aria-hidden="true"
                />
                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 font-display text-lg font-black leading-tight text-brand">
                      {campaign.name}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${displayStatusInfo.bg} ${displayStatusInfo.text}`}
                    >
                      {displayStatusInfo.label}
                    </span>
                  </div>

                  {campaign.code && (
                    <div className="mt-2">
                      <CopyCodeButton code={campaign.code} />
                    </div>
                  )}

                  {campaign.description ? (
                    <p className="mt-2 line-clamp-2 text-xs font-semibold text-muted">
                      {campaign.description}
                    </p>
                  ) : null}

                  <div className="mt-4 grid grid-cols-3 gap-2 rounded-card border border-edge bg-surface-muted p-3">
                    <div className="text-center">
                      <p className="text-[9px] font-black uppercase tracking-wider text-muted">
                        Contactado
                      </p>
                      <p className="mt-0.5 text-sm font-black text-brand">
                        +{campaign.points.CONTACTED}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-black uppercase tracking-wider text-muted">
                        Visita
                      </p>
                      <p className="mt-0.5 text-sm font-black text-brand">
                        +{campaign.points.VISIT}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-black uppercase tracking-wider text-muted">
                        Operación
                      </p>
                      <p className="mt-0.5 text-sm font-black text-brand">
                        +{campaign.points.OPERATION_COMPLETED}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs text-muted">
                    <Calendar className="size-3.5 shrink-0" />
                    <span className="truncate">
                      {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                    </span>
                  </div>

                  <div className="mt-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted">
                      Proyectos ({campaign.projects.length})
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {campaign.projects.slice(0, 3).map((project) => (
                        <span
                          key={project.id}
                          className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold text-brand"
                        >
                          {project.name.length > 20
                            ? `${project.name.slice(0, 20)}...`
                            : project.name}
                        </span>
                      ))}
                      {campaign.projects.length > 3 ? (
                        <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-bold text-muted">
                          +{campaign.projects.length - 3} más
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-auto flex items-center gap-2 pt-4">
                    <Link
                      href={ROUTES.panel.admin.campaign(campaign.id)}
                      className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-card border border-brand text-xs font-bold text-brand transition-colors hover:bg-brand hover:text-on-brand"
                    >
                      <Edit className="size-3.5" aria-hidden="true" />
                      Editar
                    </Link>
                    <DeleteCampaignButton id={campaign.id} name={campaign.name} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}

      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        buildHref={(nextPage) => `${ROUTES.panel.admin.campaigns}?page=${nextPage}`}
      />

      <Card className="border-accent/30 bg-accent/5">
        <CardContent className="p-5">
          <h3 className="text-sm font-black uppercase tracking-wide text-accent">
            Cómo funcionan las campañas
          </h3>
          <ul className="mt-3 flex flex-col gap-2 text-sm font-semibold text-ink">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
              <span>
                Los puntos de campaña son <strong>independientes</strong> de los puntos normales
                de referidos.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
              <span>
                Las campañas tienen <strong>fecha de inicio y fin</strong>. Fuera de esas fechas,
                no aplican.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
              <span>
                Cada campaña se asocia a <strong>proyectos específicos</strong>. Solo los
                referidos de esos proyectos generan puntos de campaña.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
              <span>
                Los puntos de campaña se trackean por separado y tienen su propio contador.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
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
  Icon: typeof Calendar;
}) {
  return (
    <Card className="min-w-0 p-2 text-center sm:p-4">
      <div className="flex items-center justify-center gap-3">
        <span className={`hidden size-9 shrink-0 items-center justify-center rounded-xl sm:flex ${tone}`}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="flex min-h-7 items-center justify-center text-[9px] font-black uppercase leading-tight tracking-wide text-muted sm:min-h-0 sm:text-[11px] sm:tracking-[0.16em]">{label}</p>
          <p className="mt-1 font-display text-2xl font-black tracking-tight text-brand sm:text-3xl">
            {value.toLocaleString("es-BO")}
          </p>
        </div>
      </div>
      <p className="mx-auto mt-1 max-w-56 text-[10px] font-semibold leading-tight text-muted sm:mt-2 sm:text-xs sm:leading-5">{hint}</p>
    </Card>
  );
}
