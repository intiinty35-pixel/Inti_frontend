import Link from "next/link";
import { Button, Card, CardContent, CATEGORICAL, DonutChart, RankChart, STATUS, TrendChart } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { getSession } from "@/features/auth";
import { getMySubscription, listMyLeads, listMyProperties } from "@/features/owner/api/server";
import { DashboardPanel, EmptyChart, StatCard } from "@/features/owner/components/dashboard-ui";
import { PublicationCalendar } from "@/features/owner/components/publication-calendar";
import { RecentMovements } from "@/features/owner/components/recent-movements";
import { leadsBySource, leadsPerDay } from "@/features/owner/lib/chart-data";
import { LiveClock } from "./live-clock";

const STATUS_NOTICES = {
  PENDING: {
    style: "bg-warning/10 text-warning",
    text: "Tu perfil esta pendiente de validacion administrativa. Podras publicar cuando sea aprobado.",
  },
  REJECTED: {
    style: "bg-error/10 text-error",
    text: "Tu perfil no fue aprobado. Comunicate con Ariz Proyectos para mas informacion.",
  },
} as const;

export default async function OwnerDashboardPage() {
  const [session, properties, leads, subscription] = await Promise.all([
    getSession(),
    listMyProperties(),
    listMyLeads(),
    getMySubscription(),
  ]);

  const status = session?.professionalStatus;
  const firstName = (session?.name ?? "Usuario").trim().split(/\s+/)[0];
  const notice = status === "PENDING" || status === "REJECTED" ? STATUS_NOTICES[status] : null;
  const active = properties.filter((property) => property.status === "disponible").length;
  const paused = properties.filter((property) => property.status === "reservado").length;
  const other = properties.length - active - paused;
  // eslint-disable-next-line react-hooks/purity -- server component: se calcula una vez por request para metricas relativas.
  const now = Date.now();
  const newLeads = leads.filter((lead) => (now - new Date(lead.createdAt).getTime()) / 86_400_000 <= 7)
    .length;
  const hasActivePlan = subscription?.status === "ACTIVE";
  const daysRemaining =
    hasActivePlan && subscription!.expiresAt
      ? Math.max(0, Math.ceil((new Date(subscription!.expiresAt).getTime() - now) / 86_400_000))
      : null;

  const trend = leadsPerDay(leads, 14, now);
  const total14 = trend.reduce((sum, point) => sum + point.value, 0);
  const totalLeads = leads.length;
  const statusDonut = [
    { label: "Publicadas", value: active, color: STATUS.good },
    { label: "Pausadas", value: paused, color: STATUS.warning },
    { label: "Otras", value: other, color: STATUS.critical },
  ];
  const totalStatus = statusDonut.reduce((sum, item) => sum + item.value, 0);
  const sources = leadsBySource(leads);
  const topActivity = properties
    .map((property) => ({
      label: property.title,
      value: leads.filter((lead) => lead.property?.id === property.id).length,
      color: CATEGORICAL[0],
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="min-w-0">
      <section className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,380px)] 2xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0 flex flex-col gap-6">
          <div className="relative min-h-56 overflow-hidden rounded-card border border-edge bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-brand" aria-hidden />
            <div className="relative flex min-h-40 flex-col justify-between gap-6 lg:flex-row lg:items-start">
              <div className="max-w-4xl">
                <p className="text-[11px] font-black tracking-[0.2em] text-accent uppercase">Bienvenido</p>
                <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-brand sm:text-5xl lg:text-6xl">
                  Hola, {firstName}
                </h1>
                <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-muted">
                  Un nuevo ciclo de publicaciones comienza. Tienes tu actividad, membresia y consultas listas
                  para revisar en un solo lugar.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-3">
                <Link href={ROUTES.panel.owner.subscription}>
                  <Button variant="secondary">Ver membresia</Button>
                </Link>
                <Link href={ROUTES.panel.owner.newListing}>
                  <Button>Publicar propiedad</Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 min-[1500px]:grid-cols-4">
            <StatCard
              label="Propiedades publicadas"
              value={String(properties.length)}
              hint={`${active} activas / ${paused} pausadas`}
            />
            <StatCard label="Proyectos activos" value="0" hint="0 en total" />
            <StatCard label="Consultas / Leads" value={String(leads.length)} hint={`${newLeads} nuevas`} />
            <StatCard
              label="Dias restantes"
              value={daysRemaining !== null ? String(daysRemaining) : "-"}
              hint={hasActivePlan ? subscription!.plan.name : "Sin plan"}
            />
          </div>

          {notice ? (
            <p role="status" className={`rounded-card px-4 py-3 text-sm ${notice.style}`}>
              {notice.text}
            </p>
          ) : !hasActivePlan ? (
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
                <div>
                  <p className="text-[11px] font-bold tracking-wide text-accent uppercase">Suscripcion</p>
                  <p className="mt-1 text-lg font-semibold text-ink">No tienes un plan activo</p>
                  <p className="text-sm text-muted">Activa un plan para acceder a beneficios adicionales.</p>
                </div>
                <Link href={ROUTES.panel.owner.subscription}>
                  <Button variant="secondary">Ver planes</Button>
                </Link>
              </CardContent>
            </Card>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">Analitica</p>
              <h2 className="mt-1 font-display text-2xl font-black tracking-tight text-brand">
                Rendimiento en tiempo real
              </h2>
            </div>
            <LiveClock />
          </div>

          <section className="grid min-w-0 grid-cols-1 gap-5 min-[1320px]:grid-cols-2 min-[1900px]:grid-cols-3">
            <DashboardPanel
              title="Consultas - ultimos 14 dias"
              badge={
                <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-black text-brand">
                  {total14}
                </span>
              }
            >
              {total14 > 0 ? (
                <div className="mt-4 w-full">
                  <TrendChart data={trend} color={CATEGORICAL[0]} />
                </div>
              ) : (
                <EmptyChart message="Las consultas nuevas apareceran aqui" />
              )}
            </DashboardPanel>

            <DashboardPanel title="Propiedades por estado">
              {totalStatus > 0 ? (
                <div className="mt-4 w-full">
                  <DonutChart data={statusDonut} centerLabel="propiedades" />
                </div>
              ) : (
                <EmptyChart message="Publica tu primera propiedad para ver este grafico" />
              )}
            </DashboardPanel>

            <DashboardPanel title="Actividad reciente">
              {sources.length > 0 ? (
                <div className="mt-4 w-full">
                  <div className="flex h-3 w-full overflow-hidden rounded-full">
                    {sources.map((source) => (
                      <span
                        key={source.label}
                        style={{ width: `${(source.value / totalLeads) * 100}%`, backgroundColor: source.color }}
                      />
                    ))}
                  </div>
                  <ul className="mt-4 flex flex-col gap-2 text-xs">
                    {sources.map((source) => (
                      <li key={source.label} className="flex items-center gap-2">
                        <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: source.color }} />
                        <span className="text-ink">{source.label}</span>
                        <span className="ml-auto font-semibold text-muted">{source.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <EmptyChart message="Las consultas nuevas apareceran aqui" />
              )}
            </DashboardPanel>

            <DashboardPanel title="Publicaciones con mas vistas">
              {topActivity.length > 0 && topActivity[0].value > 0 ? (
                <div className="mt-4 w-full">
                  <RankChart data={topActivity} />
                </div>
              ) : (
                <EmptyChart message="Las estadisticas apareceran cuando tus publicaciones reciban visitas" />
              )}
            </DashboardPanel>
          </section>
        </div>

        <aside className="flex min-w-0 flex-col gap-5 xl:sticky xl:top-28 xl:self-start">
          <PublicationCalendar properties={properties} expiresAt={subscription?.expiresAt} now={now} />
          <RecentMovements properties={properties} leads={leads} subscription={subscription} />
        </aside>
      </section>
    </div>
  );
}
