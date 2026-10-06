import Link from "next/link";
import { Gift } from "lucide-react";
import { Card, CardContent, Pagination } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { AdminPageHeader } from "@/app/(panel)/panel/admin/admin-shell";
import { listAdminIncentivesServer } from "@/features/rewards/api/server";
import { IncentiveCard } from "@/features/rewards/components/incentive-card";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "activos",
  INACTIVE: "inactivos",
};

export default async function AdminIncentivesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const { page: pageParam, status } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const data = await listAdminIncentivesServer(page, 20, status);

  const statusLabel = status ? STATUS_LABELS[status] || "" : "";
  const description = status
    ? `${data.total} incentivo${data.total !== 1 ? "s" : ""} ${statusLabel}`
    : `${data.total} incentivo${data.total !== 1 ? "s" : ""} registrado${data.total !== 1 ? "s" : ""} · Gestiona las recompensas disponibles para los referentes`;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        eyebrow="Programa de referidos"
        title="Incentivos"
        description={description}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Link
            href={ROUTES.panel.admin.incentives}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
              !status ? "bg-brand text-on-brand" : "bg-surface-muted text-muted hover:text-ink"
            }`}
          >
            Todos
          </Link>
          <Link
            href={`${ROUTES.panel.admin.incentives}?status=ACTIVE`}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
              status === "ACTIVE" ? "bg-brand text-on-brand" : "bg-surface-muted text-muted hover:text-ink"
            }`}
          >
            Activos
          </Link>
          <Link
            href={`${ROUTES.panel.admin.incentives}?status=INACTIVE`}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
              status === "INACTIVE" ? "bg-brand text-on-brand" : "bg-surface-muted text-muted hover:text-ink"
            }`}
          >
            Inactivos
          </Link>
        </div>
        <Link
          href={ROUTES.panel.admin.newIncentive}
          className="shrink-0 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
        >
          + Nuevo incentivo
        </Link>
      </div>

      {data.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-surface-muted">
            <Gift className="size-8 text-muted" />
          </div>
          <p className="text-sm text-muted">
            {status
              ? `No hay incentivos ${statusLabel}.`
              : "No hay incentivos registrados aún."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((incentive) => (
            <IncentiveCard key={incentive.id} incentive={incentive} />
          ))}
        </div>
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
