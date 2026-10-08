'use client';

import { Button, CheckCircleIcon } from '@/shared/ui';
import type { ClaimResponse } from '@/features/claims/api/client';

interface ClaimSuccessProps {
  claim: ClaimResponse;
  onClose: () => void;
}

export function ClaimSuccess({ claim, onClose }: ClaimSuccessProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-success/15">
        <CheckCircleIcon className="size-10 text-success" />
      </div>

      <div>
        <h2 className="font-display text-2xl font-black text-brand">
          ¡Reclamo enviado exitosamente!
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted">
          Tu solicitud ha sido registrada y será procesada por nuestro equipo.
        </p>
      </div>

      <div className="w-full max-w-sm rounded-card border border-edge bg-surface-muted p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">Código de Reclamo</p>
        <p className="mt-1 text-2xl font-black text-brand">{claim.claimCode}</p>
        <p className="mt-3 text-xs text-muted">
          Guarda este código para consultar el estado de tu reclamo.
        </p>
      </div>

      <div className="w-full max-w-sm rounded-card border border-brand-soft bg-brand-soft/30 p-4 text-left">
        <p className="text-xs font-bold uppercase tracking-wide text-brand">Resumen</p>
        <dl className="mt-2 flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Consumidor</dt>
            <dd className="font-semibold text-ink">{claim.fullName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Tipo</dt>
            <dd className="font-semibold text-ink">{claim.type === 'Claim' ? 'Reclamo' : 'Queja'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Estado</dt>
            <dd className="font-semibold text-brand">Pendiente</dd>
          </div>
        </dl>
      </div>

      <Button onClick={onClose}>
        Cerrar
      </Button>
    </div>
  );
}
