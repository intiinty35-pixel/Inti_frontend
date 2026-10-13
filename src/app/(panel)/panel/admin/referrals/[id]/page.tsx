import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ArrowLeft, CalendarDays, Gem, Mail, Phone, Ticket, TrendingUp, UserRoundCheck, UsersRound } from "lucide-react";
import { Card, CardContent } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { AdminPageHeader } from "@/app/(panel)/panel/admin/admin-shell";
import { deleteAdminReferrer, getAdminReferrer, setReferralStatus, type AdminReferral, type ReferralStatus } from "@/features/admin/api/referrals";
import { DeleteReferrerButton } from "@/features/admin/components/delete-referrer-button";
import { ReferralStatusForm } from "@/features/admin/components/referral-status-form";

const STATUS_LABELS: Record<ReferralStatus, string> = {
  CONTACTED: "Contactado",
  VISIT: "Visita",
  OPERATION_COMPLETED: "Operacion concretada",
};

const STATUS_STYLES: Record<ReferralStatus, string> = {
  CONTACTED: "bg-sky-50 text-sky-700 ring-sky-100",
  VISIT: "bg-amber-50 text-amber-700 ring-amber-100",
  OPERATION_COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

const INTEREST_LABELS: Record<string, string> = {
  VENTA: "Venta",
  COMPRA: "Compra",
  ALQUILER: "Alquilar",
  COMPRA_LOTE: "Comprar un lote",
  INVERSION: "Invertir en un proyecto",
  CORRETAJE: "Servicio de corretaje",
};

async function updateReferralStatus(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  const referrerId = String(formData.get("referrerId") ?? "");
  const status = String(formData.get("status") ?? "") as ReferralStatus;
  if (!id || !(status in STATUS_LABELS)) return;
  await setReferralStatus(id, status);
  revalidatePath(ROUTES.panel.admin.referrals);
  if (referrerId) revalidatePath(ROUTES.panel.admin.referrer(referrerId));
}

async function deleteReferrer(id: string) {
  "use server";
  await deleteAdminReferrer(id);
  revalidatePath(ROUTES.panel.admin.referrals);
  redirect(ROUTES.panel.admin.referrals);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function countByStatus(referrals: AdminReferral[], status: ReferralStatus) {
  return referrals.filter((referral) => referral.status === status).length;
}

export default async function AdminReferrerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const referrer = await getAdminReferrer(id);
  const latestReferral = referrer.referrals[0];

  return (
    <div className="flex flex-col gap-6">
      <Link href={ROUTES.panel.admin.referrals} className="inline-flex w-fit items-center gap-2 text-sm font-bold text-brand hover:underline">
        <ArrowLeft className="size-4" />
        Volver a referentes
      </Link>

      <AdminPageHeader
        eyebrow="Referente"
        title={referrer.name}
        description="Seguimiento comercial, puntos acumulados e historial de referidos."
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-brand p-5 text-on-brand sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">Codigo de referente</p>
                  <p className="mt-2 font-display text-3xl font-black tracking-tight">{referrer.code}</p>
                </div>
                <div className="rounded-card bg-white/12 px-4 py-3 text-right ring-1 ring-white/15">
                  <p className="text-[11px] font-black uppercase tracking-wide text-white/70">Total acumulado</p>
                  <p className="text-4xl font-black">{referrer.totalPoints.toLocaleString("es-PE")}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">
              <div className="rounded-card border border-edge bg-surface-muted p-4">
                <UsersRound className="size-5 text-brand" />
                <p className="mt-3 text-2xl font-black text-ink">{referrer.referrals.length}</p>
                <p className="text-xs font-bold uppercase tracking-wide text-muted">Referidos</p>
              </div>
              <div className="rounded-card border border-edge bg-surface-muted p-4">
                <UserRoundCheck className="size-5 text-brand" />
                <p className="mt-3 text-2xl font-black text-ink">{countByStatus(referrer.referrals, "OPERATION_COMPLETED")}</p>
                <p className="text-xs font-bold uppercase tracking-wide text-muted">Concretados</p>
              </div>
              <div className="rounded-card border border-edge bg-surface-muted p-4">
                <TrendingUp className="size-5 text-brand" />
                <p className="mt-3 text-2xl font-black text-ink">{countByStatus(referrer.referrals, "VISIT")}</p>
                <p className="text-xs font-bold uppercase tracking-wide text-muted">En visita</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">Contacto</p>
            <div className="mt-4 flex flex-col gap-3">
              <a href={`mailto:${referrer.email}`} className="flex min-w-0 items-center gap-3 rounded-card border border-edge bg-surface-muted p-3 text-sm font-semibold text-ink hover:border-brand">
                <Mail className="size-4 shrink-0 text-brand" />
                <span className="break-all">{referrer.email}</span>
              </a>
              <a href={`https://wa.me/${referrer.phone.replace(/\D/g, "")}`} className="flex min-w-0 items-center gap-3 rounded-card border border-edge bg-surface-muted p-3 text-sm font-semibold text-ink hover:border-brand">
                <Phone className="size-4 shrink-0 text-brand" />
                <span>{referrer.phone}</span>
              </a>
              <div className="flex items-center gap-3 rounded-card border border-edge bg-surface-muted p-3 text-sm font-semibold text-ink">
                <CalendarDays className="size-4 shrink-0 text-brand" />
                <span>{latestReferral ? `Ultimo referido: ${formatDate(latestReferral.createdAt)}` : "Sin referidos registrados"}</span>
              </div>
              <DeleteReferrerButton action={deleteReferrer.bind(null, referrer.id)} />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">Pipeline</p>
            <h2 className="mt-1 font-display text-2xl font-black tracking-tight text-ink">
              Referidos ({referrer.referrals.length})
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(STATUS_LABELS) as ReferralStatus[]).map((status) => (
              <span key={status} className={`rounded-full px-3 py-1.5 text-xs font-black ring-1 ${STATUS_STYLES[status]}`}>
                {STATUS_LABELS[status]}: {countByStatus(referrer.referrals, status)}
              </span>
            ))}
          </div>
        </div>

        {referrer.referrals.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted">
              Este referente aun no tiene referidos.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {referrer.referrals.map((referral) => (
              <Card key={referral.id} className="overflow-hidden">
                <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_180px_240px] xl:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-black text-ink">{referral.name}</h3>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-black ring-1 ${STATUS_STYLES[referral.status]}`}>
                        {STATUS_LABELS[referral.status]}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-muted sm:grid-cols-2">
                      <p className="min-w-0 break-all">
                        <span className="font-bold text-ink">Correo:</span> {referral.email}
                      </p>
                      <p>
                        <span className="font-bold text-ink">Telefono:</span> {referral.phone}
                      </p>
                      <p>
                        <span className="font-bold text-ink">Interes:</span> {INTEREST_LABELS[referral.interest] ?? referral.interest}
                      </p>
                      <p>
                        <span className="font-bold text-ink">Disponibilidad:</span> {referral.availability}
                      </p>
                    </div>

                    {referral.project ? (
                      <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-black text-brand">
                        <Gem className="size-3.5 shrink-0" />
                        <span className="truncate">Proyecto: {referral.project.name}</span>
                      </div>
                    ) : null}

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
                      <span className="inline-flex items-center gap-1.5 font-bold text-brand">
                        <Ticket className="size-3.5" />
                        Codigo {referral.code}
                      </span>
                      <span>Registrado el {formatDate(referral.createdAt)}</span>
                    </div>

                    <details className="mt-4 rounded-card border border-edge bg-surface-muted p-3">
                      <summary className="cursor-pointer text-xs font-black uppercase tracking-wide text-brand">
                        Historial ({referral.history.length})
                      </summary>
                      <div className="mt-3 flex flex-col gap-2 border-l-2 border-brand-soft pl-3">
                        {referral.history.length > 0 ? (
                          referral.history.map((entry) => (
                            <div key={entry.id} className="text-xs text-muted">
                              <span className="font-bold text-ink">{entry.toStatus}</span> · +{entry.pointsAwarded} puntos · {formatDate(entry.createdAt)}
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted">Sin movimientos registrados.</p>
                        )}
                      </div>
                    </details>
                  </div>

                  <div className="rounded-card border border-edge bg-surface-muted p-4 xl:text-right">
                    <p className="text-xs font-black uppercase tracking-wide text-muted">Puntos referido</p>
                    <p className="mt-2 text-3xl font-black text-brand">{referral.points.toLocaleString("es-PE")}</p>
                  </div>

                  <div className="rounded-card border border-edge bg-white p-4">
                    <ReferralStatusForm action={updateReferralStatus} referral={referral} referrerId={referrer.id} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
