import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Card, CardContent } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { AdminPageHeader } from "@/app/(panel)/panel/admin/admin-shell";
import { getAdminRedemptionServer } from "@/features/rewards/api/server";
import { approveRedemption, rejectRedemption, deliverRedemption } from "@/features/rewards/api/actions";

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

export default async function RedemptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let redemption;
  try {
    redemption = await getAdminRedemptionServer(id);
  } catch {
    notFound();
  }

  if (!redemption) {
    notFound();
  }

  async function handleApprove() {
    "use server";
    await approveRedemption(id);
    revalidatePath(`${ROUTES.panel.admin.redemptions}/${id}`);
  }

  async function handleReject(formData: FormData) {
    "use server";
    const reason = String(formData.get("reason") ?? "").trim();
    await rejectRedemption(id, reason || undefined);
    revalidatePath(`${ROUTES.panel.admin.redemptions}/${id}`);
  }

  async function handleDeliver() {
    "use server";
    await deliverRedemption(id);
    revalidatePath(`${ROUTES.panel.admin.redemptions}/${id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href={ROUTES.panel.admin.redemptions} className="text-sm font-bold text-brand">
        ← Volver a canjes
      </Link>

      <AdminPageHeader
        eyebrow="Canje"
        title={`Canje #${redemption.id.slice(-8).toUpperCase()}`}
        description={`${redemption.referrer.name} · ${redemption.incentiveName}`}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted">
                    Estado
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-bold ${
                      STATUS_STYLES[redemption.status]
                    }`}
                  >
                    {STATUS_LABELS[redemption.status]}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted">
                    Fecha de solicitud
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {new Date(redemption.requestedAt).toLocaleString("es-BO")}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-surface-muted p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted">
                    Referente
                  </p>
                  <p className="mt-1 text-lg font-bold text-ink">
                    {redemption.referrer.name}
                  </p>
                  <p className="mt-1 text-sm text-muted">{redemption.referrer.email}</p>
                  <p className="text-sm text-muted">{redemption.referrer.phone}</p>
                </div>
                <div className="rounded-xl bg-surface-muted p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted">
                    Código de referente
                  </p>
                  <p className="mt-1 text-lg font-bold text-accent">
                    {redemption.referralCode}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-brand-soft p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-brand">
                  Recompensa
                </p>
                <p className="mt-1 text-lg font-bold text-ink">
                  {redemption.incentiveName}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-brand">
                      Puntos utilizados
                    </p>
                    <p className="mt-1 text-2xl font-black text-brand">
                      {redemption.pointsSpent.toLocaleString("es-BO")}
                    </p>
                  </div>
                  {redemption.incentiveImageUrl && (
                    <img
                      src={redemption.incentiveImageUrl}
                      alt={redemption.incentiveName}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  )}
                </div>
              </div>

              {redemption.rejectionReason && (
                <div className="mt-6 rounded-xl bg-error/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-error">
                    Motivo de rechazo
                  </p>
                  <p className="mt-1 text-sm text-ink">{redemption.rejectionReason}</p>
                </div>
              )}

              {redemption.processedBy && (
                <div className="mt-6 border-t border-edge pt-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted">
                    Procesado por
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {redemption.processedBy.firstName} {redemption.processedBy.lastName}
                  </p>
                  <p className="text-sm text-muted">{redemption.processedBy.email}</p>
                  {redemption.processedAt && (
                    <p className="mt-1 text-xs text-muted">
                      {new Date(redemption.processedAt).toLocaleString("es-BO")}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {redemption.pointMovements && redemption.pointMovements.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-bold text-ink">Historial de movimientos</h3>
                <div className="flex flex-col gap-3">
                  {redemption.pointMovements.map((movement) => (
                    <div
                      key={movement.id}
                      className="flex items-center justify-between rounded-lg bg-surface-muted p-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-ink">{movement.description}</p>
                        <p className="mt-0.5 text-xs text-muted">
                          {new Date(movement.createdAt).toLocaleString("es-BO")}
                        </p>
                      </div>
                      <p
                        className={`text-lg font-black ${
                          movement.points > 0 ? "text-success" : "text-error"
                        }`}
                      >
                        {movement.points > 0 ? "+" : ""}
                        {movement.points} pts
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {redemption.status === "PENDING" && (
            <>
              <Card>
                <CardContent className="p-5">
                  <h3 className="mb-3 text-sm font-bold text-ink">Aprobar canje</h3>
                  <form action={handleApprove}>
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-success px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-success/90"
                    >
                      Aprobar canje
                    </button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <h3 className="mb-3 text-sm font-bold text-ink">Rechazar canje</h3>
                  <form action={handleReject} className="flex flex-col gap-3">
                    <textarea
                      name="reason"
                      rows={3}
                      placeholder="Motivo del rechazo (opcional)"
                      className="rounded-lg border border-edge bg-surface px-3 py-2 text-sm text-ink focus:border-brand focus:outline-2 focus:outline-brand/25"
                    />
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-error px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-error/90"
                      onClick={(e) => {
                        if (!confirm("¿Estás seguro de rechazar este canje? Los puntos serán devueltos al referente.")) {
                          e.preventDefault();
                        }
                      }}
                    >
                      Rechazar canje
                    </button>
                  </form>
                </CardContent>
              </Card>
            </>
          )}

          {redemption.status === "APPROVED" && (
            <Card>
              <CardContent className="p-5">
                <h3 className="mb-3 text-sm font-bold text-ink">Marcar como entregado</h3>
                <form action={handleDeliver}>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
                  >
                    Marcar como entregado
                  </button>
                </form>
              </CardContent>
            </Card>
          )}

          {(redemption.status === "DELIVERED" || redemption.status === "REJECTED") && (
            <Card>
              <CardContent className="p-5">
                <p className="text-center text-sm text-muted">
                  Este canje ya fue procesado y no requiere más acciones.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
