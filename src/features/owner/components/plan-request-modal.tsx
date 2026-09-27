"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui";
import { formatPrice } from "@/shared/lib/format";
import { OwnerRequestError, requestPlan, uploadPaymentReceipt } from "@/features/owner/api/client";
import type { Plan } from "@/features/owner/types/plan";

export function PlanRequestModal({ plan, onClose }: { plan: Plan; onClose: () => void }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleFile(selected: File | null) {
    setFile(selected);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : "");
  }

  async function handleSubmit() {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-[var(--shadow-pop)]">
        <p className="text-[11px] font-bold tracking-wide text-accent uppercase">
          Activar plan de pago
        </p>
        <h2 className="mt-1 text-xl font-semibold text-ink">{plan.name}</h2>
        <p className="text-lg font-bold text-brand">
          {formatPrice(Number(plan.price), plan.currency)} / mes
        </p>
        <p className="mt-2 text-sm text-muted">
          Sube la boleta o captura de tu pago. El administrador revisará tu comprobante y activará
          el plan.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,application/pdf"
          hidden
          onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 flex h-28 w-full flex-col items-center justify-center gap-1 rounded-card border border-dashed border-edge text-sm font-semibold text-brand hover:border-brand"
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:)
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
  );
}
