"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { WhatsappIcon } from "@/shared/ui";
import { buildArizManagerWhatsappUrl } from "@/shared/lib/whatsapp";

interface ReviewPublishModalProps {
  agencyName?: string;
  itemName: string;
  itemType: "propiedad" | "proyecto";
  open: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
}

export function ReviewPublishModal({
  agencyName,
  itemName,
  itemType,
  open,
  onClose,
  onSubmit,
}: ReviewPublishModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState(
    `Hola, gerente de ARIZ. Le escribe ${agencyName?.trim() || "la inmobiliaria"}. Solicito habilitar la publicación de mi ${itemType} "${itemName}". Quisiera coordinar el acuerdo de atención.`,
  );

  if (!open || typeof document === "undefined") return null;

  const whatsappUrl = buildArizManagerWhatsappUrl(message);

  async function submit() {
    setSubmitting(true);
    setError(null);

    try {
      await onSubmit();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo enviar a revisión.");
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-brand/45 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-card border border-edge bg-surface p-6 shadow-[var(--shadow-pop)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-publish-title"
      >
        <div className="flex shrink-0 items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black tracking-[0.18em] text-accent uppercase">
              Solicitud para inmobiliarias
            </p>
            <h2 id="review-publish-title" className="mt-1 font-display text-2xl font-black text-brand">
              Solicita habilitación para publicar
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-muted"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Envía tu solicitud al gerente por WhatsApp. Cuando hayan llegado a un acuerdo, vuelve
          aquí y manda esta ficha a la cola de revisión del administrador.
        </p>

        <label className="mt-4 block text-xs font-bold text-brand" htmlFor="review-message">
          Solicitud para el gerente
        </label>
        <textarea
          id="review-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          className="mt-1.5 w-full resize-none rounded-card border border-edge bg-surface-muted px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-card border border-[#25d366] px-4 py-3 text-sm font-bold text-[#168b43]"
        >
          <WhatsappIcon className="size-5" />
          Enviar solicitud por WhatsApp
        </a>

        {error ? <p className="mt-3 text-sm font-semibold text-error">{error}</p> : null}

        <button
          type="button"
          onClick={() => void submit()}
          disabled={submitting}
          className="mt-4 flex h-11 w-full items-center justify-center rounded-card bg-brand px-4 text-sm font-bold text-on-brand disabled:opacity-60"
        >
          {submitting ? "Enviando…" : "Ya coordiné, enviar a revisión"}
        </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}
