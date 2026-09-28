import { Card, CardContent } from "@/shared/ui";
import { formatPrice } from "@/shared/lib/format";
import { listAllPlans } from "@/features/admin/api/server";
import { PlanForm } from "@/features/admin/components/plan-form";
import { PlanActiveToggle } from "@/features/admin/components/plan-active-toggle";

export default async function AdminPlansPage() {
  const plans = await listAllPlans();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-light text-brand">Planes de suscripción</h1>
        <p className="mt-1 text-sm text-muted">
          Estos planes son los que ven las inmobiliarias en su panel al elegir una suscripción.
        </p>
      </div>

      <PlanForm />

      <div className="flex flex-col gap-3">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-ink">{plan.name}</p>
                  {plan.isDefault ? (
                    <span className="rounded-full bg-info/15 px-2 py-0.5 text-[10px] font-bold text-info">
                      POR DEFECTO
                    </span>
                  ) : null}
                  {plan.highlight ? (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                      RECOMENDADO
                    </span>
                  ) : null}
                  {!plan.isActive ? (
                    <span className="rounded-full bg-muted/20 px-2 py-0.5 text-[10px] font-bold text-muted">
                      INACTIVO
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-muted">
                  {plan.isFree ? "Sin costo" : formatPrice(Number(plan.price), plan.currency)} ·{" "}
                  {plan.propertyLimit} propiedades · {plan.projectLimit} proyectos · {plan.durationDays}{" "}
                  días
                </p>
              </div>
              <PlanActiveToggle plan={plan} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
