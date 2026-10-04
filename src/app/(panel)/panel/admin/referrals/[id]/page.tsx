import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { Card, CardContent } from '@/shared/ui';
import { ROUTES } from '@/shared/config/routes';
import { AdminPageHeader } from '@/app/(panel)/panel/admin/admin-shell';
import { getAdminReferrer, setReferralStatus, type ReferralStatus } from '@/features/admin/api/referrals';
import { ReferralStatusForm } from '@/features/admin/components/referral-status-form';

const STATUS_LABELS: Record<ReferralStatus, string> = {
  CONTACTED: 'Contactado',
  VISIT: 'Visita',
  OPERATION_COMPLETED: 'Operación concretada',
};

async function updateReferralStatus(formData: FormData) {
  'use server';
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '') as ReferralStatus;
  if (!id || !(status in STATUS_LABELS)) return;
  await setReferralStatus(id, status);
  revalidatePath(ROUTES.panel.admin.referrals);
}

export default async function AdminReferrerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const referrer = await getAdminReferrer(id);

  return (
    <div className="flex flex-col gap-6">
      <Link href={ROUTES.panel.admin.referrals} className="text-sm font-bold text-brand">
        ← Volver a referentes
      </Link>

      <AdminPageHeader
        eyebrow="Referente"
        title={referrer.name}
        description={`${referrer.email} · ${referrer.phone}`}
      />

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Código de referente</p>
            <p className="text-lg font-bold text-accent">{referrer.code}</p>
          </div>
          <div className="rounded-xl bg-brand px-5 py-3 text-right text-on-brand">
            <p className="text-[11px] font-bold uppercase tracking-wide opacity-80">Total acumulado</p>
            <p className="text-3xl font-black">{referrer.totalPoints.toLocaleString('es-PE')}</p>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-lg font-bold text-ink">
          Referidos ({referrer.referrals.length})
        </h2>

        {referrer.referrals.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted">
              Este referente aún no tiene referidos.
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {referrer.referrals.map((referral) => (
              <Card key={referral.id} className="overflow-hidden">
                <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_180px_220px] lg:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-bold text-ink">{referral.name}</p>
                      <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand">
                        {STATUS_LABELS[referral.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted">{referral.email} · {referral.phone}</p>
                    <p className="mt-2 text-sm font-semibold text-brand">
                      Proyecto: {referral.project.name}
                    </p>
                    <p className="mt-1 text-xs text-muted">Código {referral.code}</p>
                    <details className="mt-3">
                      <summary className="cursor-pointer text-xs font-bold text-brand">
                        Consultar historial ({referral.history.length})
                      </summary>
                      <div className="mt-2 flex flex-col gap-2 border-l-2 border-brand-soft pl-3">
                        {referral.history.map((entry) => (
                          <div key={entry.id} className="text-xs text-muted">
                            <span className="font-semibold text-ink">{entry.toStatus}</span> · +{entry.pointsAwarded} puntos · {new Date(entry.createdAt).toLocaleDateString('es-PE')}
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                  <div className="rounded-xl bg-surface-muted p-3 lg:text-right">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted">Puntos referido</p>
                    <p className="mt-1 text-2xl font-black text-brand">{referral.points.toLocaleString('es-PE')}</p>
                  </div>
                  <ReferralStatusForm action={updateReferralStatus} referral={referral} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}