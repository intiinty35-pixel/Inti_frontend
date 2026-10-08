'use client';

import { useState } from 'react';
import { ClaimForm } from '@/features/claims/components/claim-form';
import { ClaimSuccess } from '@/features/claims/components/claim-success';
import type { ClaimResponse } from '@/features/claims/api/client';

export function ClaimBookPage() {
  const [submittedClaim, setSubmittedClaim] = useState<ClaimResponse | null>(null);

  function handleSuccess(response: ClaimResponse) {
    setSubmittedClaim(response);
  }

  function handleClose() {
    setSubmittedClaim(null);
  }

  if (submittedClaim) {
    return <ClaimSuccess claim={submittedClaim} onClose={handleClose} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-muted">
        De acuerdo con la normativa vigente, ponemos a disposición de nuestros consumidores este formulario para registrar reclamaciones y quejas.
      </p>
      <ClaimForm onSuccess={handleSuccess} />
    </div>
  );
}
