"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui";
import { formatPrice } from "@/shared/lib/format";
import { env } from "@/shared/lib/env";
import { OwnerRequestError, requestPlan, uploadPaymentReceipt } from "@/features/owner/api/client";
import type { Plan } from "@/features/owner/types/plan";

function PaymentRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  if (!value) return null;

  async function handleCopy() {
    if (!navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-card border border-edge bg-surface px-3 py-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted">{label}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-bold text-brand transition-colors hover:bg-brand"
        >
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      <p className="mt-1 break-all text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

export function PlanRequestModal({ plan, onClose }: { plan: Plan; onClose: () => void }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleFile(selected: File | null) {
    setPreviewUrl(selected ? URL.createObjectURL(selected) : "");
  }

  async function handleSubmit() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Sube la boleta o captura de pago");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const { url } = await uploadPaymentReceipt(file);
      await requestPlan(plan.id, url);
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof OwnerRequestError ? err.messages[0] : "Ocurrió un error inesperado.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/50 p-4">
      <div className="flex min-h-full items-center justify-center">
        <div className="w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto rounded-card border border-edge bg-surface p-6 shadow-[var(--shadow-card)]">
          <p className="text-[11px] font-bold tracking-wide text-accent uppercase">Activar plan de pago</p>
          <h2 className="mt-1 text-xl font-semibold text-ink">{plan.name}</h2>
          <p className="text-lg font-bold text-brand">{formatPrice(Number(plan.price), plan.currency)} / mes</p>

          <div className="mt-4 rounded-card border border-edge bg-brand-soft p-3 text-xs text-ink">
            <p className="font-semibold">Sigue estos pasos:</p>
            <ol className="mt-1 list-decimal pl-4">
              <li>Paga el monto con Yape, Plin o una transferencia a la cuenta oficial de ARIZ.</li>
              <li>Envía tu captura de pago más abajo.</li>
              <li>El agente valida el pago y se activan tus beneficios.</li>
            </ol>
          </div>

          {env.paymentConfigured ? (
            <>
              <div className="mt-4 flex flex-col gap-2">
                <p className="text-[11px] font-bold tracking-[0.16em] text-muted uppercase">Datos para pagar</p>
                <PaymentRow label="Yape / Plin" value={env.payment.yapePlinNumber} />
                <PaymentRow label={`Cuenta corriente · ${env.payment.bankName}`} value={env.payment.bankAccount} />
                <PaymentRow label="CCI" value={env.payment.bankCci} />
                <PaymentRow label="Titular de la cuenta" value={env.payment.accountHolder} />
                <PaymentRow label="RUC" value={env.payment.taxId} />
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-card border border-edge bg-surface-muted p-3 text-xs text-ink">
              <p className="font-semibold">Datos de pago no disponibles</p>
              <p className="mt-1 text-muted">
                Aún no se han configurado los canales de pago. Solicita los datos directamente al agente
                para completar tu activación.
              </p>
            </div>
          )}

          <div className="mt-4 border-t border-edge pt-4">
            <p className="text-[11px] font-bold tracking-[0.16em] text-muted uppercase">Envía tu comprobante</p>
            <p className="mt-1 text-[11px] text-muted">
              Una vez pagado, sube la captura. El agente la validará y se activarán tus beneficios.
            </p>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,application/pdf"
            hidden
            onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
          />

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-3 flex h-24 w-full flex-col items-center justify-center gap-1 rounded-card border border-dashed border-edge text-sm font-semibold text-brand hover:border-brand"
          >
            {previewUrl ? (
              <img src={previewUrl} alt="" className="h-full rounded-card object-contain p-2" />
            ) : (
              <>
                Cargar comprobante
                <span className="text-xs font-normal text-muted">JPG, PNG o PDF</span>
              </>
            )}
          </button>

          {error ? <p className="mt-2 text-sm text-error">{error}</p> : null}

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Enviando..." : "Enviar comprobante"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}