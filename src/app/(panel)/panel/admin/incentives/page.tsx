import Link from "next/link";
import { Gift, Package, Plus, Sparkles, Trophy } from "lucide-react";
import { Card, CardContent, Pagination } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { listAdminIncentivesServer } from "@/features/rewards/api/server";
import { IncentiveCard } from "@/features/rewards/components/incentive-card";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "activos",
  INACTIVE: "inactivos",
};

const FILTERS = [
  { label: "Todos", href: ROUTES.panel.admin.incentives, status: undefined },
  { label: "Activos", href: `${ROUTES.panel.admin.incentives}?status=ACTIVE`, status: "ACTIVE" },
  { label: "Inactivos", href: `${ROUTES.panel.admin.incentives}?status=INACTIVE`, status: "INACTIVE" },
] as const;

export default async function AdminIncentivesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const { page: pageParam, status } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const data = await listAdminIncentivesServer(page, 8, status);
  const activeCount = data.items.filter((item) => item.status === "ACTIVE").length;
  const stockVisible = data.items.reduce((sum, item) => sum + item.stock, 0);
  const statusLabel = status ? STATUS_LABELS[status] || "" : "";

  return (
    <div className="flex min-w-0 max-w-full flex-col gap-7 overflow-x-hidden">
      <section className="relative overflow-hidden rounded-card border border-edge bg-surface p-5 text-center shadow-[var(--shadow-card)] sm:p-6">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-brand" aria-hidden="true" />
        <p className="text-sm font-black uppercase tracking-[0.22em] text-accent">
          Programa de referidos
        </p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-brand sm:text-5xl">
          Incentivos
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-muted sm:text-base">
          Gestiona las recompensas que los referentes pueden canjear con sus puntos.
        </p>
      </section>

      <section className="grid grid-cols-3 gap-2 sm:gap-4">
        <MetricCard
          label="Incentivos"
          value={data.total}
          hint={status ? `Total de incentivos ${statusLabel}.` : "Total registrado en el sistema."}
          tone="bg-brand-soft text-brand"
          Icon={Gift}
        />
        <MetricCard
          label="Activos visibles"
          value={activeCount}
          hint="Activos dentro de esta página."
          tone="bg-success/10 text-success"
          Icon={Sparkles}
        />
        <MetricCard
          label="Stock visible"
          value={stockVisible}
          hint="Unidades disponibles en esta página."
          tone="bg-accent/15 text-accent"
          Icon={Package}
        />
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-fit max-w-full gap-2 overflow-x-auto rounded-card bg-surface-muted/70 p-1.5">
          {FILTERS.map((filter) => {
            const active = filter.status === status || (!filter.status && !status);
            return (
              <Link
                key={filter.label}
                href={filter.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap rounded-card px-4 py-2.5 text-sm font-bold transition-colors ${
                  active
                    ? "bg-surface text-brand shadow-sm ring-1 ring-edge"
                    : "text-muted hover:bg-surface/70 hover:text-brand"
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>

        <Link
          href={ROUTES.panel.admin.newIncentive}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-card bg-brand px-4 text-sm font-black text-on-brand transition-colors hover:bg-brand-hover sm:w-auto"
        >
          <Plus className="size-4" aria-hidden="true" />
          Nuevo incentivo
        </Link>
      </div>

      {data.items.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <Trophy className="size-7" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-black text-brand">
              No hay incentivos {status ? statusLabel : "registrados"}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted">
              Crea un incentivo para que los referentes puedan canjear sus puntos.
            </p>
          </CardContent>
        </Card>
      ) : (
        <section className="grid min-w-0 max-w-full grid-cols-2 gap-2 overflow-x-hidden sm:gap-4 xl:grid-cols-4">
          {data.items.map((incentive) => (
            <IncentiveCard key={incentive.id} incentive={incentive} />
          ))}
        </section>
      )}

      <Pagination
        page={page}
        pageSize={data.pageSize}
        total={data.total}
        buildHref={(p) => `${ROUTES.panel.admin.incentives}?page=${p}${status ? `&status=${status}` : ""}`}
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
  Icon: typeof Gift;
}) {
  return (
    <Card className="min-w-0 p-2 text-center sm:p-4">
      <div className="flex items-center justify-center gap-3">
        <span className={`hidden size-9 shrink-0 items-center justify-center rounded-xl sm:flex ${tone}`}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="flex min-h-7 items-center justify-center text-[9px] font-black uppercase leading-tight tracking-wide text-muted sm:min-h-0 sm:text-[11px] sm:tracking-[0.16em]">{label}</p>
          <p className="mt-1 font-display text-2xl font-black tracking-tight text-brand sm:text-3xl">
            {value.toLocaleString("es-PE")}
          </p>
        </div>
      </div>
      <p className="mx-auto mt-1 max-w-56 text-[10px] font-semibold leading-tight text-muted sm:mt-2 sm:text-xs sm:leading-5">{hint}</p>
    </Card>
  );
}
