"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReceiptText, RefreshCw } from "lucide-react";
import { Button, Card, CardContent, CheckIcon } from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import { formatPrice } from "@/shared/lib/format";
import { OwnerRequestError, requestPlan } from "@/features/owner/api/client";
import { PlanRequestModal } from "@/features/owner/components/plan-request-modal";
import type { Plan, Subscription } from "@/features/owner/types/plan";
import { UnlimitedPlanCard } from "@/features/shared/components/unlimited-plan-card";

function daysRemaining(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000));
}

function isProjectFeature(feature: string) {
  return feature.toLowerCase().includes("proyecto");
}

interface GroupedPlan {
  propertyLimit: number;
  label: string;
  plans: { 15: Plan | null; 30: Plan | null };
}

function groupPlans(plans: Plan[]): GroupedPlan[] {
  const activePlans = plans.filter((p) => p.isActive);
  const groups = new Map<number, GroupedPlan>();

  for (const plan of activePlans) {
    const limit = plan.propertyLimit;
    if (!groups.has(limit)) {
      groups.set(limit, {
        propertyLimit: limit,
        label: limit >= 5 ? "+5 propiedades" : `${limit} propiedad${limit > 1 ? "es" : ""}`,
        plans: { 15: null, 30: null },
      });
    }
    const group = groups.get(limit)!;
    group.plans[plan.durationDays as 15 | 30] = plan;
  }

  return Array.from(groups.values()).sort((a, b) => a.propertyLimit - b.propertyLimit);
}

export function PlansView({
  plans,
  subscription,
  propertiesCount,
  projectsCount,
  canManageProjects = false,
  customerName,
}: {
  plans: Plan[];
  subscription: Subscription | null;
  propertiesCount: number;
  projectsCount: number;
  canManageProjects?: boolean;
  customerName: string;
}) {
  const router = useRouter();
  const [modalPlan, setModalPlan] = useState<Plan | null>(null);
  const [selectedGroup, setSelectedGroup] = useState(0);
  const [durations, setDurations] = useState<Record<number, 15 | 30>>({});
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const hasActive = subscription?.status === "ACTIVE";
  const isPending = subscription?.status === "PENDING_PAYMENT";
  const hasMembershipRequest = hasActive || isPending;
  const remaining = hasActive ? daysRemaining(subscription!.expiresAt) : null;

  const groupedPlans = groupPlans(plans);
  const firstPaidPlan = groupedPlans[0]?.plans[30] ?? groupedPlans[0]?.plans[15] ?? null;
  const renewalPlan = subscription?.plan ?? firstPaidPlan;

  function getDuration(groupIndex: number): 15 | 30 {
    return durations[groupIndex] ?? 30;
  }

  function toggleDuration(groupIndex: number, value: 15 | 30) {
    setDurations((prev) => ({ ...prev, [groupIndex]: value }));
  }

  function getCurrentPlan(groupIndex: number): Plan | null {
    const group = groupedPlans[groupIndex];
    if (!group) return null;
    const dur = getDuration(groupIndex);
    return group.plans[dur] ?? group.plans[30] ?? group.plans[15];
  }

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
                  Solicita la activacion de un paquete al administrador para publicar.
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
              {canManageProjects ? (
                <div>
                  <p className="text-white/60">Proyectos</p>
                  <p className="font-semibold">
                    {projectsCount}/{subscription!.plan.projectLimit}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {error ? <p className="text-sm text-error">{error}</p> : null}

      <Card className="overflow-hidden border-brand/25">
        <CardContent className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-accent">
              Membresia Ariz
            </p>
            <h2 className="mt-1 font-display text-2xl font-black tracking-tight text-brand">
              {hasMembershipRequest ? "Renueva tu membresia subiendo tu voucher" : "Activa tu membresia por primera vez"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              {hasMembershipRequest
                ? "Elige renovar, adjunta tu comprobante de pago y el administrador validara la renovacion de tu membresia."
                : "Selecciona un paquete, sube tu comprobante de pago y el administrador activara tu membresia."}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
            <button
              type="button"
              disabled={!renewalPlan || isPending}
              onClick={() => renewalPlan && setModalPlan(renewalPlan)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-card bg-brand px-4 text-sm font-bold text-on-brand shadow-[var(--shadow-card)] transition-colors hover:bg-brand-hover disabled:pointer-events-none disabled:opacity-50"
            >
              <ReceiptText className="size-4" />
              {isPending
                ? "Voucher en revision"
                : hasMembershipRequest
                  ? "Subir voucher para renovar"
                  : "Subir voucher por primera vez"}
            </button>
            {hasMembershipRequest ? (
              <button
                type="button"
                disabled={!renewalPlan || isPending}
                onClick={() => renewalPlan && setModalPlan(renewalPlan)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-card border border-edge bg-surface px-4 text-sm font-bold text-ink transition-colors hover:border-brand disabled:pointer-events-none disabled:opacity-50"
              >
                <RefreshCw className="size-4" />
                Renovar membresia
              </button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {groupedPlans.map((group, index) => {
          const selected = selectedGroup === index;
          const duration = getDuration(index);
          const currentPlan = getCurrentPlan(index);
          const isCurrent = currentPlan && subscription?.plan.id === currentPlan.id && hasActive;
          const isRequestedPending = currentPlan && subscription?.plan.id === currentPlan.id && isPending;
          const features = currentPlan
            ? canManageProjects
              ? currentPlan.features
              : currentPlan.features.filter((feature) => !isProjectFeature(feature))
            : [];

          return (
            <button
              key={index}
              type="button"
              aria-pressed={selected}
              onClick={() => setSelectedGroup(index)}
              className={cn(
                "relative flex min-h-96 flex-col overflow-hidden rounded-card border bg-surface text-left shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]",
                selected ? "border-brand ring-2 ring-brand/20" : "border-edge",
                isCurrent && "border-success bg-success/5",
                isRequestedPending && "border-warning bg-warning/5",
              )}
            >
              <span className={cn("h-1.5 w-full", selected ? "bg-brand" : "bg-accent")} aria-hidden />
              {selected ? (
                <span className="absolute right-4 top-4 rounded-full bg-success px-2.5 py-1 text-[10px] font-black tracking-wide text-white">
                  SELECCIONADO
                </span>
              ) : null}
              {isCurrent ? (
                <span className="absolute left-4 top-4 rounded-full bg-success px-2.5 py-0.5 text-[10px] font-bold text-white">
                  ACTIVO
                </span>
              ) : null}

              <span className="flex flex-1 flex-col items-center gap-4 p-5 pt-7 text-center">
                <span className="text-[11px] font-black tracking-wide text-muted uppercase">
                  {group.label}
                </span>
                <span className="font-display text-5xl font-black tracking-tight text-brand">
                  {group.propertyLimit >= 5 ? "+5" : group.propertyLimit}
                </span>
                <span className="text-sm font-semibold text-ink">
                  {group.propertyLimit === 1 ? "propiedad activa" : "propiedades activas"}
                </span>

                <span className="w-full rounded-card border border-edge bg-canvas px-4 py-3">
                  <span className="block text-[11px] font-bold tracking-wide text-muted uppercase">
                    Elige vigencia
                  </span>
                  <div className="mt-2 flex gap-1">
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); toggleDuration(index, 15); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); toggleDuration(index, 15); } }}
                      className={cn(
                        "flex-1 cursor-pointer rounded-md px-2 py-1.5 text-xs font-bold transition-colors",
                        duration === 15 ? "bg-brand text-on-brand" : "bg-surface-muted text-muted hover:text-ink",
                      )}
                    >
                      15 días
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); toggleDuration(index, 30); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); toggleDuration(index, 30); } }}
                      className={cn(
                        "flex-1 cursor-pointer rounded-md px-2 py-1.5 text-xs font-bold transition-colors",
                        duration === 30 ? "bg-brand text-on-brand" : "bg-surface-muted text-muted hover:text-ink",
                      )}
                    >
                      30 días
                    </span>
                  </div>
                  <span className="mt-2 block text-2xl font-black text-brand">
                    {currentPlan ? formatPrice(Number(currentPlan.price), currentPlan.currency) : "S/ 0"}
                  </span>
                </span>

                <ul className="mt-2 flex w-full flex-col gap-1.5 text-left text-xs text-ink">
                  {features.map((feature) => (
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
                ) : (
                  <Button className="mt-2" onClick={(e) => { e.stopPropagation(); setSelectedGroup(index); setModalPlan(getCurrentPlan(index)); }}>
                    Elegir paquete
                  </Button>
                )}
              </span>
            </button>
          );
        })}
        <UnlimitedPlanCard customerName={customerName} userType="REAL_ESTATE" />
      </div>

      {selectedGroup !== null && getCurrentPlan(selectedGroup) ? (
        <Card className="overflow-hidden">
          <div className="h-1.5 bg-brand" aria-hidden />
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-accent">
                  Paquete seleccionado
                </p>
                <p className="mt-1 text-lg font-bold text-brand">
                  {groupedPlans[selectedGroup]?.label} · {getDuration(selectedGroup)} días · {getCurrentPlan(selectedGroup) ? formatPrice(Number(getCurrentPlan(selectedGroup)!.price), getCurrentPlan(selectedGroup)!.currency) : ""}
                </p>
              </div>
              <Button onClick={() => setModalPlan(getCurrentPlan(selectedGroup))}>
                Subir comprobante de pago
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {modalPlan ? <PlanRequestModal plan={modalPlan} onClose={() => setModalPlan(null)} /> : null}
    </div>
  );
}
