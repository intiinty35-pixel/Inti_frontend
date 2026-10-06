import { Card, CheckIcon, Pagination } from "@/shared/ui";
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

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex min-w-0 flex-col gap-4 p-4 sm:p-5">
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand text-base font-black text-on-brand sm:size-12 sm:text-lg">
                  {plan.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="min-w-0 break-words text-base font-bold text-ink [overflow-wrap:anywhere]">
                    {plan.name}
                  </p>
                  {plan.isDefault ? (
                    <span className="rounded-full bg-info/15 px-2 py-1 text-[10px] leading-tight font-bold text-info">
                      POR DEFECTO
                    </span>
                  ) : null}
                  {plan.highlight ? (
                    <span className="rounded-full bg-accent/15 px-2 py-1 text-[10px] leading-tight font-bold text-accent">
                      RECOMENDADO
                    </span>
                  ) : null}
                  {!plan.isActive ? (
                    <span className="rounded-full bg-muted/20 px-2 py-1 text-[10px] leading-tight font-bold text-muted">
                      INACTIVO
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-lg font-bold text-brand">
                  {plan.isFree ? "Sin costo" : formatPrice(Number(plan.price), plan.currency)}
                  {!plan.isFree ? <span className="text-xs font-semibold text-muted"> / mes</span> : null}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-2">
              <div className="min-w-0 rounded-lg bg-canvas px-3 py-2.5">
                <dt className="text-[10px] font-bold tracking-wide text-muted uppercase">Propiedades</dt>
                <dd className="mt-0.5 break-words text-sm font-bold text-ink">
                  {plan.propertyLimit}
                </dd>
              </div>
              <div className="min-w-0 rounded-lg bg-canvas px-3 py-2.5">
                <dt className="text-[10px] font-bold tracking-wide text-muted uppercase">Vigencia</dt>
                <dd className="mt-0.5 text-sm font-bold text-ink">{plan.durationDays} días</dd>
              </div>
              {plan.projectLimit > 0 ? (
                <div className="col-span-2 min-w-0 rounded-lg bg-canvas px-3 py-2.5">
                  <dt className="text-[10px] font-bold tracking-wide text-muted uppercase">
                    Proyectos para inmobiliarias
                  </dt>
                  <dd className="mt-0.5 text-sm font-bold text-ink">{plan.projectLimit}</dd>
                </div>
              ) : null}
            </dl>

            <div className="min-w-0 border-t border-edge pt-3">
              <p className="text-[10px] font-bold tracking-wide text-muted uppercase">Atributos del plan</p>
              {plan.features.length > 0 ? (
                <ul className="mt-2 grid min-w-0 gap-2 sm:grid-cols-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex min-w-0 items-start gap-2 text-xs leading-relaxed text-ink">
                      <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-success" />
                      <span className="min-w-0 break-words [overflow-wrap:anywhere]">{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-muted">Sin atributos adicionales.</p>
              )}
            </div>

            <div className="border-t border-edge pt-3">
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
