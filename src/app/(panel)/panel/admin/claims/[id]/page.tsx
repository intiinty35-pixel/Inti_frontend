import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/shared/ui';
import { ROUTES } from '@/shared/config/routes';
import { AdminPageHeader } from '@/app/(panel)/panel/admin/admin-shell';
import { getAdminClaim } from '@/features/claims/api/server';

const COMPANY_INFO = {
  businessName: 'ARIZ GROUP S.A.C.',
  ruc: '20615573711',
  address: 'Jr. Lopez Aldana 286, La Victoria, Lima, Perú',
};

export default async function AdminClaimDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let claim;
  try {
    claim = await getAdminClaim(id);
  } catch {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href={ROUTES.panel.admin.claims} className="text-sm font-bold text-brand">
        ← Volver a reclamos
      </Link>

      <AdminPageHeader
        eyebrow="Detalle del reclamo"
        title={claim.claimCode}
        description={`${claim.fullName} · ${claim.type === 'Claim' ? 'Reclamo' : 'Queja'}`}
      />

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">Información de la Empresa</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Razón Social</p>
              <p className="mt-1 text-sm font-semibold text-ink">{COMPANY_INFO.businessName}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">RUC</p>
              <p className="mt-1 text-sm font-semibold text-ink">{COMPANY_INFO.ruc}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Dirección</p>
              <p className="mt-1 text-sm font-semibold text-ink">{COMPANY_INFO.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">Consumidor</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Nombre Completo</p>
              <p className="mt-1 text-sm font-semibold text-ink">{claim.fullName}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Dirección</p>
              <p className="mt-1 text-sm font-semibold text-ink">{claim.address}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">DNI / CE</p>
              <p className="mt-1 text-sm font-semibold text-ink">{claim.dniOrCe}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Teléfono</p>
              <p className="mt-1 text-sm font-semibold text-ink">{claim.phone || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Correo Electrónico</p>
              <p className="mt-1 text-sm font-semibold text-ink">{claim.email}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Padre o Madre</p>
              <p className="mt-1 text-sm font-semibold text-ink">{claim.parentGuardian || '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">Bien Contratado</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Tipo de Bien</p>
              <p className="mt-1 text-sm font-semibold text-ink">{claim.assetType}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Monto Reclamado</p>
              <p className="mt-1 text-sm font-semibold text-ink">S/ {Number(claim.claimedAmount).toFixed(2)}</p>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Descripción del Bien</p>
              <p className="mt-1 text-sm text-ink">{claim.assetDescription}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">Reclamo</h2>
          <div className="grid gap-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted">Tipo</p>
                <p className="mt-1 text-sm font-bold text-brand">{claim.type === 'Claim' ? 'Reclamo' : 'Queja'}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Detalles del Reclamo</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-ink">{claim.claimDetails}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Pedido del Consumidor</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-ink">{claim.consumerRequest}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">Registro</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Código de Reclamo</p>
              <p className="mt-1 font-mono text-sm font-bold text-brand">{claim.claimCode}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Creado</p>
              <p className="mt-1 text-sm text-ink">{new Date(claim.createdAt).toLocaleString('es-PE')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
