"use client";

import { useState } from "react";
import { WhatsappIcon } from "@/shared/ui/icons";

interface AgentContactCardProps {
  name: string;
  phone?: string;
  email?: string;
  whatsappDigits?: string;
}

export function AgentContactCard({ name, phone, email, whatsappDigits }: AgentContactCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [consultOpen, setConsultOpen] = useState(false);

  const maskedPhone = phone ? `${phone.slice(0, Math.max(3, phone.length - 5))}•••••` : null;
  const whatsappUrl = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`Hola ${name}, vi tu perfil en ARIZ y quisiera más información.`)}`
    : undefined;
  const mailUrl = email ? `mailto:${email}?subject=${encodeURIComponent("Consulta desde ARIZ")}` : undefined;

  return (
    <div className="w-full rounded-card border border-edge bg-surface p-5 shadow-[var(--shadow-card)] lg:max-w-sm">
      <p className="text-sm font-bold text-ink">¿Necesitas nuestro asesoramiento?</p>

      {phone ? (
        <div className="mt-4 flex items-center justify-between gap-3">
          {revealed ? (
            <a href={`tel:${phone}`} className="text-lg font-black text-brand">
              {phone}
            </a>
          ) : (
            <span className="text-lg font-black tracking-wide text-ink">{maskedPhone}</span>
          )}
          {!revealed ? (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="text-sm font-bold text-brand underline-offset-2 hover:underline"
            >
              Ver teléfono
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 grid gap-2">
        {whatsappUrl ? (
          <button
            type="button"
            onClick={() => setConsultOpen(true)}
            className="flex h-12 items-center justify-center gap-2 rounded-card bg-brand text-sm font-bold text-on-brand transition-opacity hover:opacity-90"
          >
            <WhatsappIcon className="size-4.5" />
            Enviar consulta
          </button>
        ) : mailUrl ? (
          <a
            href={mailUrl}
            className="flex h-12 items-center justify-center rounded-card bg-brand text-sm font-bold text-on-brand transition-opacity hover:opacity-90"
          >
            Enviar consulta
          </a>
        ) : null}

        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 items-center justify-center gap-2 rounded-card bg-[#25d366] text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            <WhatsappIcon className="size-4.5" />
            Contactar por WhatsApp
          </a>
        ) : null}
      </div>

      {consultOpen && whatsappUrl ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Enviar consulta por WhatsApp"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-ink/60" onClick={() => setConsultOpen(false)} aria-hidden="true" />

          <div className="relative w-full max-w-sm overflow-hidden rounded-card border border-edge bg-surface p-6 shadow-[var(--shadow-pop)]">
            <WhatsappIcon className="mx-auto size-12 text-[#25d366]" />

            <h3 className="mt-3 text-center text-lg font-black tracking-tight text-ink">Mejor por WhatsApp</h3>
            <p className="mt-2 text-center text-sm leading-6 text-muted">
              Respuesta instantánea y siempre funciona: habla directo y sin esperas.
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-card bg-[#25d366] text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              <WhatsappIcon className="size-4.5" />
              Continuar por WhatsApp
            </a>

            <button
              type="button"
              onClick={() => setConsultOpen(false)}
              className="mt-2.5 flex h-11 w-full items-center justify-center rounded-card border border-edge text-sm font-semibold text-muted transition-colors hover:bg-surface-muted"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={() => setConsultOpen(false)}
              aria-label="Cerrar"
              className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full border border-edge text-muted transition-colors hover:bg-surface-muted"
            >
              ✕
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}