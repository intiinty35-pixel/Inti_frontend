import Link from 'next/link';
import { Card, CardContent, Pagination } from '@/shared/ui';
import { ROUTES } from '@/shared/config/routes';
import { AdminPageHeader } from '@/app/(panel)/panel/admin/admin-shell';
import { listAdminReferrals } from '@/features/admin/api/referrals';

export default async function AdminReferralsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const data = await listAdminReferrals(page);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        eyebrow="Programa de referidos"
        title="Referentes"
        description={`${data.total} referentes registrados · Los puntos se calculan automáticamente según los estados alcanzados.`}
      />

      <div className="horizontal-scrollbar-hidden flex flex-nowrap gap-3 overflow-x-auto sm:flex-wrap sm:overflow-visible">
        {data.statusPoints.map((point) => (
          <div key={point.status} className="shrink-0 rounded-xl bg-brand-soft px-3 py-2.5 sm:px-4 sm:py-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted sm:text-xs">
              {point.label}
            </p>
            <p className="mt-1 text-sm font-black text-brand sm:text-lg">+{point.points} puntos</p>
          </div>
        ))}
      </div>

      {data.items.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-sm text-muted">Aún no hay referentes registrados.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((referrer) => (
            <Link key={referrer.id} href={`${ROUTES.panel.admin.referrals}/${referrer.id}`}>
              <Card className="h-full transition-shadow hover:shadow-lg">
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-bold text-ink">{referrer.name}</p>
                      <p className="mt-1 truncate text-sm text-muted">{referrer.email}</p>
                      <p className="mt-1 text-sm text-muted">{referrer.phone}</p>
                    </div>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-on-brand">
                      {referrer.referrals.length}
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-edge pt-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-muted">Código</p>
                      <p className="text-sm font-semibold text-accent">{referrer.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold uppercase tracking-wide text-muted">Total puntos</p>
                      <p className="text-xl font-black text-brand">{referrer.totalPoints.toLocaleString('es-PE')}</p>
                    </div>
                  </div>
                  <p className="text-center text-xs font-semibold text-brand">Ver referidos →</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
      <Pagination page={page} pageSize={data.pageSize} total={data.total} buildHref={(p) => `${ROUTES.panel.admin.referrals}?page=${p}`} />
    </div>
  );
}
