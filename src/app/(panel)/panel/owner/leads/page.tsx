import { Card, CardContent, Pagination } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { OwnerPageHeader } from "@/app/(panel)/panel/owner/owner-shell";
import { listMyLeadsPaged } from "@/features/owner/api/server";

const SOURCE_LABELS: Record<string, string> = {
  PROPERTY_FORM: "Formulario de propiedad",
  WHATSAPP: "WhatsApp",
  QUICK_QUESTION: "Pregunta rápida",
  PHONE: "Teléfono",
};

export default async function OwnerLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { items: leads, total, pageSize } = await listMyLeadsPaged(page);

  return (
    <div className="flex flex-col gap-6">
      <OwnerPageHeader eyebrow="Contactos" title="Leads y consultas" />
      <p className="-mt-4 text-sm text-muted">
        Personas interesadas en tus publicaciones. {total} en total.
      </p>

      {leads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <p className="text-sm font-semibold text-ink">Sin información todavía</p>
            <p className="text-xs text-muted">
              Las consultas realizadas desde tus propiedades y proyectos aparecerán aquí.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {leads.map((lead) => (
              <Card key={lead.id}>
                <CardContent className="flex flex-col gap-1 pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-ink">{lead.name}</p>
                    <span className="text-[11px] font-bold text-muted uppercase">
                      {SOURCE_LABELS[lead.source]}
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    Interesado en <span className="font-medium text-ink">{lead.property.title}</span>
                  </p>
                  <p className="text-sm text-ink">{lead.message}</p>
                  <p className="text-xs text-muted">
                    {lead.email}
                    {lead.phone ? ` · ${lead.phone}` : ""}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            buildHref={(p) => `${ROUTES.panel.owner.leads}?page=${p}`}
          />
        </>
      )}
    </div>
  );
}
