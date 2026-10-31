import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Coins,
  Gift,
  PackageCheck,
  ShoppingBag,
  Ticket,
  XCircle,
} from "lucide-react";
import { Card, CardContent, Pagination } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { listAdminRedemptionsServer } from "@/features/rewards/api/server";
import type { RedemptionStatus } from "@/features/rewards/types/rewards";

const STATUS_STYLES: Record<RedemptionStatus, string> = {
  PENDING: "bg-warning/10 text-warning",
  APPROVED: "bg-info/10 text-info",
  REJECTED: "bg-error/10 text-error",
  DELIVERED: "bg-success/10 text-success",
  CANCELLED: "bg-surface-muted text-muted",
};

const STATUS_LABELS: Record<RedemptionStatus, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

const STATUS_ICONS: Record<RedemptionStatus, typeof Clock> = {
  PENDING: Clock,
  APPROVED: CheckCircle2,
  REJECTED: XCircle,
  DELIVERED: PackageCheck,
  CANCELLED: XCircle,
};

const FILTERS: Array<{ label: string; status?: RedemptionStatus }> = [
  { label: "Todos" },
  { label: "Pendientes", status: "PENDING" },
  { label: "Aprobados", status: "APPROVED" },
  { label: "Rechazados", status: "REJECTED" },
  { label: "Entregados", status: "DELIVERED" },
  { label: "Cancelados", status: "CANCELLED" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function AdminRedemptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const { page: pageParam, status: rawStatus } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const status = Object.keys(STATUS_LABELS).includes(String(rawStatus))
    ? (rawStatus as RedemptionStatus)
    : undefined;
  const data = await listAdminRedemptionsServer(page, 12, status);
  const visiblePoints = data.items.reduce((sum, redemption) => sum + redemption.pointsSpent, 0);
  const pendingVisible = data.items.filter((redemption) => redemption.status === "PENDING").length;

  return (
    <div className="flex min-w-0 max-w-full flex-col gap-7 overflow-x-hidden">
      <section className="relative overflow-hidden rounded-card border border-edge bg-surface p-5 text-center shadow-[var(--shadow-card)] sm:p-6">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-brand" aria-hidden="true" />
        <p className="text-sm font-black uppercase tracking-[0.22em] text-accent">
          Programa de referidos
        </p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-brand sm:text-5xl">
          Canjes
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-muted sm:text-base">
          Gestiona solicitudes de recompensa, valida pendientes y marca entregas cuando correspondan.
        </p>
      </section>

      <section className="grid grid-cols-3 gap-2 sm:gap-4">
        <MetricCard
          label="Canjes"
          value={data.total}
          hint={status ? `Total en estado ${STATUS_LABELS[status].toLowerCase()}.` : "Total registrado en el sistema."}
          tone="bg-brand-soft text-brand"
          Icon={ShoppingBag}
        />
        <MetricCard
          label="Pendientes visibles"
          value={pendingVisible}
          hint="Solicitudes por revisar en esta página."
          tone="bg-warning/15 text-warning"
          Icon={Clock}
        />
        <MetricCard
          label="Puntos visibles"
          value={visiblePoints}
          hint="Puntos usados en esta página."
          tone="bg-accent/15 text-accent"
          Icon={Coins}
        />
      </section>

      <div className="flex w-fit max-w-full gap-2 overflow-x-auto rounded-card bg-surface-muted/70 p-1.5">
        {FILTERS.map((filter) => {
          const active = filter.status === status || (!filter.status && !status);
          const href = filter.status
            ? `${ROUTES.panel.admin.redemptions}?status=${filter.status}`
            : ROUTES.panel.admin.redemptions;

          return (
            <Link
              key={filter.label}
              href={href}
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

      {data.items.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <ShoppingBag className="size-7" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-black text-brand">
              No hay canjes {status ? STATUS_LABELS[status].toLowerCase() : "registrados"}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted">
              Cuando un referente solicite una recompensa, aparecerá en esta bandeja.
            </p>
          </CardContent>
        </Card>
      ) : (
        <section className="grid min-w-0 max-w-full gap-4 overflow-x-hidden md:grid-cols-2 xl:grid-cols-4">
          {data.items.map((redemption) => {
            const StatusIcon = STATUS_ICONS[redemption.status];

            return (
              <Link
                key={redemption.id}
                href={ROUTES.panel.admin.redemption(redemption.id)}
                className="min-w-0"
              >
                <Card className="flex h-full min-w-0 flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]">
                  <div className="h-1.5 bg-brand" aria-hidden="true" />
                  <CardContent className="flex flex-1 flex-col p-4 text-center">
                    <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                      <Gift className="size-6" aria-hidden="true" />
                    </span>
                    <span
                      className={`mx-auto mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black ${STATUS_STYLES[redemption.status]}`}
                    >
                      <StatusIcon className="size-3.5" aria-hidden="true" />
                      {STATUS_LABELS[redemption.status]}
                    </span>

                    <h2 className="mt-3 line-clamp-2 break-words font-display text-lg font-black leading-tight text-brand">
                      {redemption.incentiveName}
                    </h2>
                    <p className="mt-2 line-clamp-1 text-xs font-semibold text-muted">
                      {redemption.referrer.name}
                    </p>

                    <div className="mt-4 grid gap-2 text-xs text-muted">
                      <p className="flex min-w-0 items-center justify-center gap-2">
                        <Ticket className="size-4 shrink-0 text-accent" aria-hidden="true" />
                        <span className="truncate font-bold text-brand">{redemption.referralCode}</span>
                      </p>
                      <p className="truncate">{formatDate(redemption.requestedAt)}</p>
                    </div>

                    <div className="mt-5 border-y border-edge py-3 text-center">
                      <Coins className="mx-auto size-4 text-accent" aria-hidden="true" />
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-muted">
                        Puntos usados
                      </p>
                      <p className="mt-1 text-lg font-black text-brand">
                        {redemption.pointsSpent.toLocaleString("es-BO")}
                      </p>
                    </div>

                    <span className="mt-auto inline-flex h-10 items-center justify-center gap-2 pt-4 text-xs font-black text-brand">
                      Ver detalle
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </section>
      )}

      <Pagination
        page={page}
        pageSize={data.pageSize}
        total={data.total}
        buildHref={(p) =>
          `${ROUTES.panel.admin.redemptions}?page=${p}${status ? `&status=${status}` : ""}`
        }
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
  Icon: typeof ShoppingBag;
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
            {value.toLocaleString("es-BO")}
          </p>
        </div>
      </div>
      <p className="mx-auto mt-1 max-w-56 text-[10px] font-semibold leading-tight text-muted sm:mt-2 sm:text-xs sm:leading-5">{hint}</p>
    </Card>
  );
}
