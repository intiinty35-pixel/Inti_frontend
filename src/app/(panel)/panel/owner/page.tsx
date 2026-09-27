import Link from "next/link";
import { BarChart, Button, Card, CardContent, STATUS, TrendChart } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { getSession } from "@/features/auth";
import { OwnerPageHeader } from "@/app/(panel)/panel/owner/owner-shell";
import { getMySubscription, listMyLeads, listMyProperties } from "@/features/owner/api/server";
import { leadsPerDay } from "@/features/owner/lib/chart-data";

const STATUS_NOTICES = {
  PENDING: {
    style: "bg-warning/10 text-warning",
    text: "Tu perfil está pendiente de validación administrativa. Podrás publicar cuando sea aprobado.",
  },
  REJECTED: {
    style: "bg-error/10 text-error",
    text: "Tu perfil no fue aprobado. Comunícate con Ariz Proyectos para más información.",
  },
} as const;

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs font-semibold text-muted">{label}</p>
        <p className="mt-2 text-3xl font-light text-brand">{value}</p>
        <p className="mt-1 text-[11px] text-muted">{hint}</p>
      </CardContent>
    </Card>
  );
}

export default async function OwnerDashboardPage() {
  const [session, properties, leads, subscription] = await Promise.all([
    getSession(),
    listMyProperties(),
    listMyLeads(),
    getMySubscription(),
  ]);

  const status = session?.professionalStatus;
  const notice = status === "PENDING" || status === "REJECTED" ? STATUS_NOTICES[status] : null;
  const active = properties.filter((property) => property.status === "disponible").length;
  const paused = properties.filter((property) => property.status === "reservado").length;
  const other = properties.length - active - paused;
  // eslint-disable-next-line react-hooks/purity -- server component: se ejecuta una vez por request, no se vuelve a renderizar en cliente.
  const now = Date.now();
  const newLeads = leads.filter((lead) => (now - new Date(lead.createdAt).getTime()) / 86_400_000 <= 7)
    .length;
  const hasActivePlan = subscription?.status === "ACTIVE";
  const daysRemaining =
    hasActivePlan && subscription!.expiresAt
      ? Math.max(0, Math.ceil((new Date(subscription!.expiresAt).getTime() - now) / 86_400_000))
      : null;

  const trend = leadsPerDay(leads, 14, now);
  const statusBars = [
    { label: "Publicadas", value: active, color: STATUS.good },
    { label: "Pausadas", value: paused, color: STATUS.warning },
    { label: "Otras", value: other, color: STATUS.critical },
  ].filter((item) => item.value > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <OwnerPageHeader eyebrow="Resumen" title="Dashboard" />
        <Link href={ROUTES.panel.owner.newListing}>
          <Button>Publicar propiedad</Button>
        </Link>
      </div>

      {notice ? (
        <p role="status" className={`rounded-card px-4 py-3 text-sm ${notice.style}`}>
          {notice.text}
        </p>
      ) : !hasActivePlan ? (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
            <div>
              <p className="text-[11px] font-bold tracking-wide text-accent uppercase">
                Suscripción
              </p>
              <p className="mt-1 text-lg font-semibold text-ink">No tienes un plan activo</p>
              <p className="text-sm text-muted">Activa un plan para acceder a beneficios adicionales.</p>
            </div>
            <Link href={ROUTES.panel.owner.subscription}>
              <Button variant="secondary">Ver planes</Button>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Propiedades publicadas"
          value={String(properties.length)}
          hint={`${active} activas / ${paused} pausadas`}
        />
        <StatCard label="Proyectos activos" value="0" hint="0 en total" />
        <StatCard label="Consultas / Leads" value={String(leads.length)} hint={`${newLeads} nuevas`} />
        <StatCard
          label="Días restantes"
          value={daysRemaining !== null ? String(daysRemaining) : "—"}
          hint={hasActivePlan ? subscription!.plan.name : "Sin plan"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardContent className="pt-6">
            <p className="font-semibold text-ink">Consultas de los últimos 14 días</p>
            {leads.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm font-semibold text-ink">Sin información todavía</p>
                <p className="text-xs text-muted">Las consultas nuevas aparecerán aquí.</p>
              </div>
            ) : (
              <div className="mt-4">
                <TrendChart data={trend} />
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="font-semibold text-ink">Propiedades por estado</p>
            {statusBars.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm font-semibold text-ink">Sin información todavía</p>
                <p className="text-xs text-muted">Publica tu primera propiedad para ver este gráfico.</p>
              </div>
            ) : (
              <div className="mt-4">
                <BarChart data={statusBars} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <p className="font-semibold text-ink">Actividad reciente</p>
            {leads.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm font-semibold text-ink">Sin información todavía</p>
                <p className="text-xs text-muted">Las consultas nuevas aparecerán aquí.</p>
              </div>
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {leads.slice(0, 5).map((lead) => (
                  <li key={lead.id} className="text-sm">
                    <span className="font-medium text-ink">{lead.name}</span>{" "}
                    <span className="text-muted">consultó por {lead.property.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="font-semibold text-ink">Publicaciones con más vistas</p>
            <div className="py-10 text-center">
              <p className="text-sm font-semibold text-ink">Sin información todavía</p>
              <p className="text-xs text-muted">Publica tu primera propiedad para ver estadísticas.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
