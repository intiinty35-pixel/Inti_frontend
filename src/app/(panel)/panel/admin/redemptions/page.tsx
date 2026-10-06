import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Card, CardContent, Pagination } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { AdminPageHeader } from "@/app/(panel)/panel/admin/admin-shell";
import { listAdminRedemptionsServer } from "@/features/rewards/api/server";

const STATUS_STYLES = {
  PENDING: "bg-warning/10 text-warning",
  APPROVED: "bg-info/10 text-info",
  REJECTED: "bg-error/10 text-error",
  DELIVERED: "bg-success/10 text-success",
  CANCELLED: "bg-surface-muted text-muted",
} as const;

const STATUS_LABELS = {
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
} as const;

export default async function AdminRedemptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const { page: pageParam, status } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const data = await listAdminRedemptionsServer(page, 20, status);

  const statusLabel = status ? STATUS_LABELS[status as keyof typeof STATUS_LABELS]?.toLowerCase() || "" : "";
  const description = status
    ? `${data.total} canje${data.total !== 1 ? "s" : ""} ${statusLabel}`
    : `${data.total} canje${data.total !== 1 ? "s" : ""} registrado${data.total !== 1 ? "s" : ""} · Gestiona las solicitudes de canje de los referentes`;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        eyebrow="Programa de referidos"
        title="Canjes"
        description={description}
      />

      <div className="flex gap-2 overflow-x-auto">
        <Link
          href={ROUTES.panel.admin.redemptions}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
            !status ? "bg-brand text-on-brand" : "bg-surface-muted text-muted hover:text-ink"
          }`}
        >
          Todos
        </Link>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <Link
            key={key}
            href={`${ROUTES.panel.admin.redemptions}?status=${key}`}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
              status === key ? "bg-brand text-on-brand" : "bg-surface-muted text-muted hover:text-ink"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {data.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-surface-muted">
            <ShoppingBag className="size-8 text-muted" />
          </div>
          <p className="text-sm text-muted">
            {status
              ? `No hay canjes ${statusLabel}.`
              : "No hay canjes registrados aún."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {data.items.map((redemption) => (
            <Link key={redemption.id} href={`${ROUTES.panel.admin.redemptions}/${redemption.id}`}>
              <Card className="transition-shadow hover:shadow-lg">
                <CardContent className="flex flex-wrap items-center gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-ink">
                      {redemption.referrer.name}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      Código:{" "}
                      <span className="font-semibold text-accent">
                        {redemption.referralCode}
                      </span>
                    </p>
                    <p className="mt-1 text-sm font-semibold text-brand">
                      {redemption.incentiveName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted">
                      Puntos
                    </p>
                    <p className="text-xl font-black text-brand">
                      {redemption.pointsSpent.toLocaleString("es-PE")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted">
                      Fecha
                    </p>
                    <p className="text-sm font-semibold text-ink">
                      {new Date(redemption.requestedAt).toLocaleDateString("es-PE")}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        STATUS_STYLES[redemption.status]
                      }`}
                    >
                      {STATUS_LABELS[redemption.status]}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-brand">Ver detalle →</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
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
