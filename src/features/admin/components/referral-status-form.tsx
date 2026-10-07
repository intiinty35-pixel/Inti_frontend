"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/shared/ui";
import type { AdminReferral } from "@/features/admin/api/referrals";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending} className="w-full">
      {pending ? "Guardando..." : "Actualizar"}
    </Button>
  );
}

export function ReferralStatusForm({
  action,
  referral,
  referrerId,
}: {
  action: (formData: FormData) => void;
  referral: AdminReferral;
  referrerId: string;
}) {
  return (
    <form action={action} className="flex min-w-0 flex-col gap-2">
      <input type="hidden" name="id" value={referral.id} />
      <input type="hidden" name="referrerId" value={referrerId} />
      <label htmlFor={`status-${referral.id}`} className="text-[10px] font-black uppercase tracking-[0.14em] text-muted">
        Estado
      </label>
      <select
        id={`status-${referral.id}`}
        name="status"
        defaultValue={referral.status}
        className="h-10 min-w-0 rounded-card border border-edge bg-surface px-3 text-sm font-semibold text-ink"
      >
        <option value="CONTACTED">Contactado</option>
        <option value="VISIT">Visita</option>
        <option value="OPERATION_COMPLETED">Operación concretada</option>
      </select>
      <SubmitButton />
    </form>
  );
}
