'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/shared/ui';
import type { AdminReferral } from '@/features/admin/api/referrals';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" size="sm" disabled={pending}>{pending ? 'Guardando...' : 'Actualizar estado'}</Button>;
}

export function ReferralStatusForm({ action, referral }: { action: (formData: FormData) => void; referral: AdminReferral }) {
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={referral.id} />
      <label htmlFor={`status-${referral.id}`} className="text-xs font-bold text-brand">Cambiar estado</label>
      <select id={`status-${referral.id}`} name="status" defaultValue={referral.status} className="h-10 rounded-card border border-edge bg-surface px-3 text-sm text-ink">
        <option value="CONTACTED">Contactado</option>
        <option value="VISIT">Visita</option>
        <option value="OPERATION_COMPLETED">Operación concretada</option>
      </select>
      <SubmitButton />
    </form>
  );
}
