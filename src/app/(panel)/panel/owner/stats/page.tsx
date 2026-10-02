import { BarChart, CATEGORICAL, RankChart, TrendChart } from "@/shared/ui";
import { OwnerPageHeader } from "@/app/(panel)/panel/owner/owner-shell";
import { DashboardPanel, EmptyChart, StatCard } from "@/features/owner/components/dashboard-ui";
import { listMyLeads, listMyProperties } from "@/features/owner/api/server";
import { leadsBySource, leadsPerDay } from "@/features/owner/lib/chart-data";

export default async function OwnerStatsPage() {
  const [properties, leads] = await Promise.all([listMyProperties(), listMyLeads()]);
  const whatsappLeads = leads.filter((lead) => lead.source === "WHATSAPP").length;
  // eslint-disable-next-line react-hooks/purity -- server component: se ejecuta una vez por request, no se vuelve a renderizar en cliente.
  const now = Date.now();
  const trend = leadsPerDay(leads, 30, now);
  const total30 = trend.reduce((sum, point) => sum + point.value, 0);
  const bySource = leadsBySource(leads);
  const topProperties = properties
    .map((property) => ({
      label: property.title,
      value: leads.filter((lead) => lead.property?.id === property.id).length,
      color: CATEGORICAL[0],
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="flex flex-col gap-6">
      <OwnerPageHeader eyebrow="Rendimiento" title="Estadísticas" />
      <p className="-mt-4 text-sm text-muted">
        Información calculada desde la actividad disponible ({properties.length} publicaciones).
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 min-[1500px]:grid-cols-4">
        <StatCard label="Visualizaciones" value="0" hint="Disponible próximamente" />
        <StatCard label="Contactos" value={String(leads.length)} hint="Últimos 30 días" />
        <StatCard label="WhatsApp" value={String(whatsappLeads)} hint="Últimos 30 días" />
        <StatCard label="Consultas recibidas" value={String(leads.length)} hint="Total histórico" />
      </div>

      <section className="grid min-w-0 grid-cols-1 gap-5 min-[1320px]:grid-cols-2">
        <DashboardPanel
          title="Consultas - últimos 30 días"
          badge={
            <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-black text-brand">
              {total30}
            </span>
          }
        >
          {total30 > 0 ? (
            <div className="mt-4 w-full">
              <TrendChart data={trend} color={CATEGORICAL[0]} />
            </div>
          ) : (
            <EmptyChart message="Las consultas nuevas aparecerán aquí" />
          )}
        </DashboardPanel>

        <DashboardPanel title="Consultas por canal">
          {bySource.length > 0 ? (
            <div className="mt-4 w-full">
              <BarChart data={bySource} />
            </div>
          ) : (
            <EmptyChart message="Aún no recibes consultas" />
          )}
        </DashboardPanel>
      </section>

      <DashboardPanel title="Publicaciones con más consultas">
        {topProperties.length > 0 && topProperties[0].value > 0 ? (
          <div className="mt-4 w-full text-left">
            <RankChart data={topProperties} />
          </div>
        ) : (
          <EmptyChart message="El conteo de visualizaciones por propiedad aún no está disponible" />
        )}
      </DashboardPanel>
    </div>
  );
}
