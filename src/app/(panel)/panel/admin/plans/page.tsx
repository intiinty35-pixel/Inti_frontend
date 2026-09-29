import { Card, Pagination } from "@/shared/ui";
import { formatPrice } from "@/shared/lib/format";
import { ROUTES } from "@/shared/config/routes";
import { listAllPlans } from "@/features/admin/api/server";
import { PlanForm } from "@/features/admin/components/plan-form";
import { PlanActiveToggle } from "@/features/admin/components/plan-active-toggle";
import { AdminPageHeader } from "@/app/(panel)/panel/admin/admin-shell";

interface AdminPlansPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminPlansPage({ searchParams }: AdminPlansPageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { items: plans, total, pageSize } = await listAllPlans(page);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        eyebrow="Suscripciones"
        title="Planes de suscripcion"
        description="Estos planes son los que ven las inmobiliarias en su panel al elegir una suscripcion."
      />

      <PlanForm />

      <div className="grid gap-4 lg:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand text-lg font-black text-on-brand">
                  {plan.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-bold text-ink">{plan.name}</p>
                    {plan.isDefault ? (
                      <span className="rounded-full bg-info/15 px-2.5 py-1 text-[11px] font-bold text-info">
                        POR DEFECTO
                      </span>
                    ) : null}
                    {plan.highlight ? (
                      <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-bold text-accent">
                        RECOMENDADO
                      </span>
                    ) : null}
                    {!plan.isActive ? (
                      <span className="rounded-full bg-muted/20 px-2.5 py-1 text-[11px] font-bold text-muted">
                        INACTIVO
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-lg font-bold text-brand">
                    {plan.isFree ? "Sin costo" : formatPrice(Number(plan.price), plan.currency)}
                  </p>
                  <p className="text-sm text-muted">
                    Agentes: {plan.propertyLimit} propiedades - {plan.durationDays} dias
                    {plan.projectLimit > 0 ? (
                      <span className="block">
                        Inmobiliarias: {plan.propertyLimit} propiedades - {plan.projectLimit} proyectos
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>
              <PlanActiveToggle plan={plan} />
            </div>
          </Card>
        ))}
      </div>

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        buildHref={(p) => `${ROUTES.panel.admin.plans}?page=${p}`}
      />
    </div>
  );
}
