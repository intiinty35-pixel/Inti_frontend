"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, CheckIcon } from "@/shared/ui";
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
  const visiblePlans = [...plans].sort(
    (a, b) => a.propertyLimit - b.propertyLimit || Number(a.price) - Number(b.price),
  );

  async function activateFreePlan(plan: Plan) {
    setError("");
    setActivatingId(plan.id);
    try {
      await requestPlan(plan.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof OwnerRequestError ? err.messages[0] : "Ocurrio un error inesperado.");
    } finally {
      setActivatingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-card border border-edge bg-brand p-6 text-white shadow-[var(--shadow-card)]">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-accent" aria-hidden />
        <div className="flex flex-col items-center justify-center gap-4 text-center lg:flex-row lg:justify-between lg:text-left">
          <div>
            <p className="text-[11px] font-bold tracking-wide text-accent uppercase">
              {hasActive ? "Plan actual" : "Suscripcion"}
            </p>
            {hasActive ? (
              <>
                <p className="text-lg font-semibold">{subscription!.plan.name}</p>
                <p className="text-sm text-white/70">Activa - {remaining ?? 0} dias restantes</p>
              </>
            ) : isPending ? (
              <>
                <p className="text-lg font-semibold">Revisando tu comprobante</p>
                <p className="text-sm text-white/70">
                  Solicitaste {subscription!.plan.name}. Te avisaremos cuando el administrador lo apruebe.
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold">No tienes un plan activo</p>
                <p className="text-sm text-white/70">
                  Solicita la activación de un paquete al administrador para publicar.
                </p>
              </>
            )}
          </div>
          {hasActive ? (
            <div className="flex items-center justify-center gap-6 text-sm">
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
      </div>

      {error ? <p className="text-sm text-error">{error}</p> : null}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {visiblePlans.map((plan) => {
          const isCurrent = subscription?.plan.id === plan.id && hasActive;
          const isRequestedPending = subscription?.plan.id === plan.id && isPending;

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative overflow-hidden",
                plan.highlight && "border-brand",
                isCurrent && "border-success bg-success/5",
                isRequestedPending && "border-warning bg-warning/5",
              )}
            >
              <div
                className={cn(
                  "h-1",
                  isCurrent ? "bg-success" : isRequestedPending ? "bg-warning" : plan.highlight ? "bg-brand" : "bg-accent",
                )}
                aria-hidden
              />
              {plan.highlight && !isCurrent && !isRequestedPending ? (
                <span className="absolute right-4 top-4 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold text-on-accent">
                  MAS BENEFICIOS
                </span>
              ) : null}
              {isCurrent ? (
                <span className="absolute right-4 top-4 rounded-full bg-success px-2.5 py-0.5 text-[10px] font-bold text-white">
                  ACTIVO
                </span>
              ) : isRequestedPending ? (
                <span className="absolute right-4 top-4 rounded-full bg-warning px-2.5 py-0.5 text-[10px] font-bold text-white">
                  EN REVISION
                </span>
              ) : null}

              <CardContent className="flex h-full min-h-96 flex-col gap-4 pt-6 text-center">
                <div>
                  <p className="text-[11px] font-black tracking-wide text-muted uppercase">{plan.name}</p>
                  <p className="mt-3 font-display text-5xl font-black tracking-tight text-brand">
                    {plan.propertyLimit}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {plan.propertyLimit === 1 ? "propiedad activa" : "propiedades activas"}
                  </p>
                </div>

                <div className="rounded-card border border-edge bg-canvas px-4 py-3">
                  <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Inversion mensual</p>
                  <p className="mt-1 text-2xl font-black text-brand">
                    {plan.isFree ? "Sin costo" : formatPrice(Number(plan.price), plan.currency)}
                  </p>
                  <p className="text-xs font-semibold text-muted">{plan.durationDays} dias de vigencia</p>
                </div>

                <ul className="flex flex-1 flex-col gap-2 text-left text-xs text-ink">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-success" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button variant="secondary" disabled className="mt-2">
                    Plan actual
                  </Button>
                ) : isRequestedPending ? (
                  <Button variant="secondary" disabled className="mt-2">
                    Pendiente de revision
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
                    Elegir paquete
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
