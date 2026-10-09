import Link from 'next/link';
import { Eye } from 'lucide-react';
import { Card, CardContent, Pagination } from '@/shared/ui';
import { AlertIcon } from '@/shared/ui/icons';
import { ROUTES } from '@/shared/config/routes';
import { AdminPageHeader } from '@/app/(panel)/panel/admin/admin-shell';
import { listAdminClaims } from '@/features/claims/api/server';
import { ClaimsExportButton } from './claims-export-button';

const TYPE_LABELS: Record<string, string> = {
  Claim: 'Reclamo',
  Complaint: 'Queja',
};

export default async function AdminClaimsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  let data: Awaited<ReturnType<typeof listAdminClaims>> | null = null;
  let loadError = false;

  try {
    data = await listAdminClaims(page);
  } catch {
    loadError = true;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <AdminPageHeader
          eyebrow="Gestión de reclamos"
          title="Libro de Reclamaciones"
          description={data ? `${data.total} reclamos registrados · Gestiona y revisa los reclamos.` : 'Gestiona y revisa los reclamos.'}
        />
        {data && data.items.length > 0 && <ClaimsExportButton />}
      </div>

      {loadError ? (
        <Card>
          <CardContent className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-error/10 text-error">
              <AlertIcon className="size-7" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-black text-brand">
              No se pudo cargar el listado
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted">
              Hubo un error al cargar los reclamos. Verifica la conexión con el servidor e intenta nuevamente.
            </p>
            <Link
              href={`${ROUTES.panel.admin.claims}?page=${page}`}
              className="mt-6 inline-flex items-center rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-on-brand transition-colors hover:bg-brand/90"
            >
              Reintentar
            </Link>
          </CardContent>
        </Card>
      ) : data!.items.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <AlertIcon className="size-7" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-black text-brand">No hay reclamos registrados</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted">
              Cuando se registre un reclamo desde el formulario público, aparecerá aquí.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-card border border-edge bg-surface md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-edge bg-surface-muted">
                  <tr>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted">Código</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted">Consumidor</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted">Tipo</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted">Bien</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted">Fecha</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-edge">
                  {data!.items.map((claim) => (
                    <tr key={claim.id} className="transition-colors hover:bg-surface-muted/50">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{claim.claimCode}</td>
                      <td className="px-4 py-3 font-semibold text-ink">{claim.fullName}</td>
                      <td className="px-4 py-3 text-muted">{TYPE_LABELS[claim.type] || claim.type}</td>
                      <td className="px-4 py-3 text-muted">{claim.assetType}</td>
                      <td className="px-4 py-3 text-muted">{new Date(claim.createdAt).toLocaleDateString('es-PE')}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`${ROUTES.panel.admin.claims}/${claim.id}`}
                          className="inline-flex size-8 items-center justify-center rounded-lg text-brand transition-colors hover:bg-brand-soft"
                          title="Ver detalle"
                        >
                          <Eye className="size-4" aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:hidden">
            {data!.items.map((claim) => (
              <Link
                key={claim.id}
                href={`${ROUTES.panel.admin.claims}/${claim.id}`}
                className="block rounded-card border border-edge bg-surface p-4 transition-colors hover:border-brand/30 hover:bg-surface-muted/50"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-mono text-xs font-semibold text-brand">{claim.claimCode}</p>
                    <p className="mt-1 font-semibold text-ink">{claim.fullName}</p>
                  </div>
                  <Eye className="size-4 shrink-0 text-brand" aria-hidden="true" />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                  <span>{TYPE_LABELS[claim.type] || claim.type}</span>
                  <span className="hidden sm:inline">·</span>
                  <span>{claim.assetType}</span>
                  <span className="ml-auto text-xs">{new Date(claim.createdAt).toLocaleDateString('es-PE')}</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {data ? (
        <Pagination page={page} pageSize={data.pageSize} total={data.total} buildHref={(p) => `${ROUTES.panel.admin.claims}?page=${p}`} />
      ) : null}
    </div>
  );
}
