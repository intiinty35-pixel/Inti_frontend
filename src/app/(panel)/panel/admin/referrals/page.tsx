import Link from "next/link";
import {
  ArrowUpRight,
  Coins,
  Mail,
  Phone,
  Settings2,
  Ticket,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Card, CardContent, Pagination } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { listAdminReferrals } from "@/features/admin/api/referrals";
import { ReferralPointsForm } from "@/features/admin/components/referral-points-form";
import { ReferralsExportButtons } from "./referrals-export-buttons";

export default async function AdminReferralsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const data = await listAdminReferrals(page, 12);
  const visibleReferrals = data.items.reduce((sum, referrer) => sum + referrer.referrals.length, 0);
  const visiblePoints = data.items.reduce((sum, referrer) => sum + referrer.totalPoints, 0);

  return (
    <div className="flex min-w-0 max-w-full flex-col gap-7 overflow-x-hidden">
      <section className="relative overflow-hidden rounded-card border border-edge bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-brand" aria-hidden="true" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-accent">
              Programa de referidos
            </p>
            <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-brand sm:text-5xl">
              Referentes
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-muted sm:text-base sm:mx-0">
              Los puntos se calculan con reglas configurables por estado. Puedes cambiar los valores
              desde esta vista.
            </p>
          </div>
          {data.items.length > 0 && <ReferralsExportButtons />}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Referentes"
          value={data.total}
          hint="Personas con codigo registrado."
          tone="bg-brand-soft text-brand"
          Icon={UsersRound}
        />
        <MetricCard
          label="Referidos visibles"
          value={visibleReferrals}
          hint="Referidos cargados en esta pagina."
          tone="bg-accent/15 text-accent"
          Icon={UserRound}
        />
        <MetricCard
          label="Puntos visibles"
          value={visiblePoints}
          hint="Suma acumulada visible."
          tone="bg-success/10 text-success"
          Icon={Coins}
        />
      </section>

      <section className="rounded-card border border-edge bg-surface p-4 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-accent">
              Reglas de puntos
            </p>
            <h2 className="mt-1 text-lg font-black text-brand">Configuracion actual</h2>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-black text-brand">
            <Settings2 className="size-3.5" aria-hidden="true" />
            Editable aqui
          </span>
        </div>
        <ReferralPointsForm statusPoints={data.statusPoints} />
      </section>

      {data.items.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <UsersRound className="size-7" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-black text-brand">
              Aun no hay referentes registrados
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted">
              Cuando se registren codigos de referencia, apareceran aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <section className="grid min-w-0 max-w-full gap-4 overflow-x-hidden md:grid-cols-2 xl:grid-cols-4">
          {data.items.map((referrer) => (
            <Link
              key={referrer.id}
              href={ROUTES.panel.admin.referrer(referrer.id)}
              className="min-w-0"
            >
              <Card className="flex h-full min-w-0 flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]">
                <div className="h-1.5 bg-brand" aria-hidden="true" />
                <CardContent className="flex flex-1 flex-col p-4 text-center">
                  <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                    <UserRound className="size-6" aria-hidden="true" />
                  </span>
                  <h2 className="mt-3 line-clamp-2 break-words font-display text-lg font-black leading-tight text-brand">
                    {referrer.name}
                  </h2>
                  <div className="mt-3 grid gap-2 text-xs text-muted">
                    <p className="flex min-w-0 items-center justify-center gap-2">
                      <Mail className="size-4 shrink-0 text-accent" aria-hidden="true" />
                      <span className="truncate">{referrer.email}</span>
                    </p>
                    <p className="flex min-w-0 items-center justify-center gap-2">
                      <Phone className="size-4 shrink-0 text-accent" aria-hidden="true" />
                      <span className="truncate">{referrer.phone}</span>
                    </p>
                    <p className="flex min-w-0 items-center justify-center gap-2">
                      <Ticket className="size-4 shrink-0 text-accent" aria-hidden="true" />
                      <span className="truncate font-bold text-brand">{referrer.code}</span>
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2 border-y border-edge py-3 text-center">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted">
                        Referidos
                      </p>
                      <p className="mt-1 text-lg font-black text-brand">
                        {referrer.referrals.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted">
                        Puntos
                      </p>
                      <p className="mt-1 text-lg font-black text-brand">
                        {referrer.totalPoints.toLocaleString("es-PE")}
                      </p>
                    </div>
                  </div>

                  <span className="mt-auto inline-flex h-10 items-center justify-center gap-2 pt-4 text-xs font-black text-brand">
                    Ver referidos
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      )}

      <Pagination
        page={page}
        pageSize={data.pageSize}
        total={data.total}
        buildHref={(p) => `${ROUTES.panel.admin.referrals}?page=${p}`}
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  tone,
  Icon,
}: {
  label: string;
  value: number;
  hint: string;
  tone: string;
  Icon: typeof UsersRound;
}) {
  return (
    <Card className="p-4 text-center">
      <div className="flex items-center justify-center gap-3">
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted">{label}</p>
          <p className="mt-1 font-display text-3xl font-black tracking-tight text-brand">
            {value.toLocaleString("es-PE")}
          </p>
        </div>
      </div>
      <p className="mx-auto mt-2 max-w-56 text-xs font-semibold leading-5 text-muted">{hint}</p>
    </Card>
  );
}
