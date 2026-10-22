import { Card, CheckIcon, Pagination } from "@/shared/ui";
import { formatPrice } from "@/shared/lib/format";
import { ROUTES } from "@/shared/config/routes";
import { listAllPlans } from "@/features/admin/api/server";
import { PlanForm } from "@/features/admin/components/plan-form";
import { PlanActiveToggle } from "@/features/admin/components/plan-active-toggle";

interface AdminPlansPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminPlansPage({ searchParams }: AdminPlansPageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { items: plans, total, pageSize } = await listAllPlans(page, 12);
  const planTones = [
    {
      bar: "bg-brand",
      badge: "bg-brand-soft text-brand",
      ring: "border-brand/15",
      surface: "bg-brand-soft/45",
    },
    {
      bar: "bg-accent",
      badge: "bg-accent/15 text-accent",
      ring: "border-accent/20",
      surface: "bg-accent/10",
    },
    {
      bar: "bg-success",
      badge: "bg-success/10 text-success",
      ring: "border-success/20",
      surface: "bg-success/5",
    },
    {
      bar: "bg-info",
      badge: "bg-info/10 text-info",
      ring: "border-info/20",
      surface: "bg-info/5",
    },
  ] as const;

  return (
    <div className="flex min-w-0 max-w-full flex-col gap-6 overflow-x-hidden">
      <div className="flex flex-col items-center gap-5 text-center">
        <header className="relative w-full overflow-hidden rounded-card border border-edge bg-surface p-5 text-center shadow-[var(--shadow-card)] sm:p-6">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-brand" aria-hidden="true" />
          <p className="text-sm font-black uppercase tracking-[0.22em] text-accent">
            Suscripciones
          </p>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-brand sm:text-5xl">
            Planes
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-muted sm:text-base">
            Planes disponibles para inmobiliarias y profesionales.
          </p>
        </header>
        <PlanForm />
      </div>

      <section className="grid min-w-0 max-w-full grid-cols-1 gap-4 overflow-x-hidden sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan, index) => {
          const visibleFeatures = plan.features.slice(0, 3);
          const hiddenFeatures = Math.max(0, plan.features.length - visibleFeatures.length);
          const tone = planTones[index % planTones.length];

          return (
            <Card
              key={plan.id}
              className={`flex min-w-0 flex-col overflow-hidden border ${tone.ring} ${tone.surface} transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]`}
            >
              <div className={`h-1.5 ${tone.bar}`} aria-hidden="true" />
              <div className="flex flex-1 min-w-0 flex-col p-4 text-center">
                <div className="flex min-w-0 flex-col items-center gap-3">
                  <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-black ${tone.badge}`}>
                    {plan.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-accent">
                      Plan
                    </p>
                    <h2 className="mt-1 line-clamp-2 break-words font-display text-lg font-black leading-tight text-brand">
                      {plan.name}
                    </h2>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  {plan.isDefault ? (
                    <span className="rounded-full bg-info/15 px-2 py-1 text-[10px] font-black text-info">
                      Por defecto
                    </span>
                  ) : null}
                  {plan.highlight ? (
                    <span className="rounded-full bg-accent/15 px-2 py-1 text-[10px] font-black text-accent">
                      Recomendado
                    </span>
                  ) : null}
                  {!plan.isActive ? (
                    <span className="rounded-full bg-muted/20 px-2 py-1 text-[10px] font-black text-muted">
                      Inactivo
                    </span>
                  ) : null}
                </div>

                <p className="mt-4 font-display text-3xl font-black tracking-tight text-brand">
                  {plan.isFree ? "S/ 0" : formatPrice(Number(plan.price), plan.currency)}
                  {!plan.isFree ? <span className="text-xs font-bold text-muted"> / mes</span> : null}
                </p>

                <dl className="mt-4 grid grid-cols-3 gap-2 border-y border-edge py-3 text-center">
                  <div>
                    <dt className="text-[10px] font-black uppercase tracking-[0.12em] text-muted">
                      Props.
                    </dt>
                    <dd className="mt-1 text-lg font-black text-brand">{plan.propertyLimit}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-black uppercase tracking-[0.12em] text-muted">
                      Proy.
                    </dt>
                    <dd className="mt-1 text-lg font-black text-brand">{plan.projectLimit}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-black uppercase tracking-[0.12em] text-muted">
                      Días
                    </dt>
                    <dd className="mt-1 text-lg font-black text-brand">{plan.durationDays}</dd>
                  </div>
                </dl>

                <div className="mt-4 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted">
                    Beneficios
                  </p>
                  {visibleFeatures.length > 0 ? (
                    <ul className="mt-2 grid min-w-0 gap-2">
                      {visibleFeatures.map((feature) => (
                        <li key={feature} className="flex min-w-0 items-start justify-center gap-2 text-xs leading-relaxed text-ink">
                          <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-success" />
                          <span className="min-w-0 break-words [overflow-wrap:anywhere]">{feature}</span>
                        </li>
                      ))}
                      {hiddenFeatures > 0 ? (
                        <li className="text-xs font-bold text-muted">
                          +{hiddenFeatures} más
                        </li>
                      ) : null}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs text-muted">Sin beneficios adicionales.</p>
                  )}
                </div>

                <div className="mt-auto pt-4">
                  <PlanActiveToggle plan={plan} />
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        buildHref={(p) => `${ROUTES.panel.admin.plans}?page=${p}`}
      />
    </div>
  );
}
