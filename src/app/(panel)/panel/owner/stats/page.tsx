import { BarChart, Card, CardContent, TrendChart } from "@/shared/ui";
import { OwnerPageHeader } from "@/app/(panel)/panel/owner/owner-shell";
import { listMyLeads, listMyProperties } from "@/features/owner/api/server";
import { leadsBySource, leadsPerDay } from "@/features/owner/lib/chart-data";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs font-semibold text-muted">{label}</p>
        <p className="mt-2 text-3xl font-light text-brand">{value}</p>
        <p className="mt-1 text-[11px] text-muted">Últimos 30 días</p>
      </CardContent>
    </Card>
  );
}

export default async function OwnerStatsPage() {
  const [properties, leads] = await Promise.all([listMyProperties(), listMyLeads()]);
  const whatsappLeads = leads.filter((lead) => lead.source === "WHATSAPP").length;
  // eslint-disable-next-line react-hooks/purity -- server component: se ejecuta una vez por request, no se vuelve a renderizar en cliente.
  const now = Date.now();
  const trend = leadsPerDay(leads, 30, now);
  const bySource = leadsBySource(leads);

  return (
    <div className="flex flex-col gap-6">
      <OwnerPageHeader eyebrow="Rendimiento" title="Estadísticas" />
      <p className="-mt-4 text-sm text-muted">
        Información calculada desde la actividad disponible ({properties.length} publicaciones).
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Visualizaciones" value="0" />
        <StatCard label="Contactos" value={String(leads.length)} />
        <StatCard label="WhatsApp" value={String(whatsappLeads)} />
        <StatCard label="Consultas recibidas" value={String(leads.length)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardContent className="pt-6">
            <p className="font-semibold text-ink">Consultas de los últimos 30 días</p>
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
            <p className="font-semibold text-ink">Consultas por canal</p>
            {bySource.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm font-semibold text-ink">Sin información todavía</p>
                <p className="text-xs text-muted">Aún no recibes consultas.</p>
              </div>
            ) : (
              <div className="mt-4">
                <BarChart data={bySource} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="font-semibold text-ink">Publicaciones más vistas</p>
          <div className="py-10 text-center">
            <p className="text-sm font-semibold text-ink">Sin información todavía</p>
            <p className="text-xs text-muted">
              El conteo de visualizaciones por propiedad aún no está disponible.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
