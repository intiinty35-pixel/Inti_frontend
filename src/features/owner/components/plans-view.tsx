"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent } from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import { formatPrice } from "@/shared/lib/format";
import { OwnerRequestError, requestPlan } from "@/features/owner/api/client";
import { PlanRequestModal } from "@/features/owner/components/plan-request-modal";
import type { Plan, Subscription } from "@/features/owner/types/plan";

function daysRemaining(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000));
}

export function PlansView({
  plans,
  subscription,
  propertiesCount,
  projectsCount,
}: {
  plans: Plan[];
  subscription: Subscription | null;
  propertiesCount: number;
  projectsCount: number;
}) {
  const router = useRouter();
  const [modalPlan, setModalPlan] = useState<Plan | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const hasActive = subscription?.status === "ACTIVE";
  const isPending = subscription?.status === "PENDING_PAYMENT";
  const remaining = hasActive ? daysRemaining(subscription!.expiresAt) : null;

  async function activateFreePlan(plan: Plan) {
    setError("");
    setActivatingId(plan.id);
    try {
      await requestPlan(plan.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof OwnerRequestError ? err.messages[0] : "Ocurrió un error inesperado.");
    } finally {
      setActivatingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6",
          hasActive ? "bg-brand text-white" : "bg-brand text-white",
        )}
      >
        <div>
          <p className="text-[11px] font-bold tracking-wide text-accent uppercase">
            {hasActive ? "Plan actual" : isPending ? "Suscripción" : "Suscripción"}
          </p>
          {hasActive ? (
            <>
              <p className="text-lg font-semibold">{subscription!.plan.name}</p>
              <p className="text-sm text-white/70">
                Activa · {remaining ?? 0} días restantes
              </p>
            </>
          ) : isPending ? (
            <>
              <p className="text-lg font-semibold">Revisando tu comprobante</p>
              <p className="text-sm text-white/70">
                Solicitaste {subscription!.plan.name}. Te avisaremos cuando el administrador lo
                apruebe.
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold">No tienes un plan activo</p>
              <p className="text-sm text-white/70">Activa un plan para comenzar a publicar.</p>
            </>
          )}
        </div>
        {hasActive ? (
          <div className="flex items-center gap-6 text-sm">
            <div>
              <p className="text-white/60">Propiedades</p>
              <p className="font-semibold">
                {propertiesCount}/{subscription!.plan.propertyLimit}
              </p>
            </div>
            <div>
              <p className="text-white/60">Proyectos</p>
              <p className="font-semibold">
                {projectsCount}/{subscription!.plan.projectLimit}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {error ? <p className="text-sm text-error">{error}</p> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const isCurrent = subscription?.plan.id === plan.id && hasActive;
          const isRequestedPending = subscription?.plan.id === plan.id && isPending;

          return (
            <Card key={plan.id} className={cn("relative", plan.highlight && "border-brand")}>
              {plan.highlight ? (
                <span className="absolute -top-2.5 left-4 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold text-on-accent">
                  RECOMENDADO
                </span>
              ) : null}
              <CardContent className="flex h-full flex-col gap-3 pt-6">
                <p className="font-semibold text-ink">{plan.name}</p>
                <p className="text-2xl font-light text-brand">
                  {plan.isFree ? "Sin costo" : `${formatPrice(Number(plan.price), plan.currency)} / mes`}
                </p>
                <div className="text-xs text-muted">
                  <p>{plan.propertyLimit} propiedades</p>
                  <p>{plan.projectLimit} proyectos</p>
                  <p>{plan.durationDays} días</p>
                </div>
                <ul className="flex flex-1 flex-col gap-1 text-xs text-ink">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-1.5">
                      <span className="text-success">✓</span> {feature}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <Button variant="secondary" disabled className="mt-2">
                    Plan actual
                  </Button>
                ) : isRequestedPending ? (
                  <Button variant="secondary" disabled className="mt-2">
                    Pendiente de revisión
                  </Button>
                ) : plan.isFree ? (
                  <Button
                    variant="secondary"
                    className="mt-2"
                    disabled={activatingId === plan.id}
                    onClick={() => activateFreePlan(plan)}
                  >
                    {activatingId === plan.id ? "Activando..." : "Activar plan"}
                  </Button>
                ) : (
                  <Button className="mt-2" onClick={() => setModalPlan(plan)}>
                    Elegir plan
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {modalPlan ? <PlanRequestModal plan={modalPlan} onClose={() => setModalPlan(null)} /> : null}
    </div>
  );
}
