"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { createLead } from "@/features/leads/api";
import type { LeadSource, LeadTarget } from "@/features/leads/types/lead";
import { WhatsappIcon } from "@/shared/ui/icons";

export type LeadFormProps = {
  source?: LeadSource;
  defaultMessage?: string;
  compact?: boolean;
  /** Enlace wa.me del anunciante. Sin enlace, el boton se muestra deshabilitado. */
  whatsappUrl?: string;
} & LeadTarget;

const field =
  "h-12 w-full rounded-xl border border-ink/60 bg-transparent px-4 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-[#0f6148] focus:ring-2 focus:ring-[#0f6148]/20";

function MailLineIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7.5 8 6 8-6" />
    </svg>
  );
}

function SuccessModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-success-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-surface p-7 text-center shadow-2xl"
      >
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#0f6148]/10 text-[#0f6148]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="size-7" aria-hidden>
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h3 id="lead-success-title" className="mt-4 text-lg font-bold text-ink">
          ¡Mensaje enviado correctamente!
        </h3>
        <p className="mt-1.5 text-sm text-muted">El contacto de la publicación recibirá tu consulta y se comunicará contigo.</p>
        <button
          type="button"
          autoFocus
          onClick={onClose}
          className="mt-6 h-11 w-full rounded-xl bg-[#0f6148] text-sm font-bold text-white transition-colors hover:bg-[#0b4d3a]"
        >
          Entendido
        </button>
      </div>
    </div>,
    document.body,
  );
}

export function LeadForm({
  propertyId,
  projectId,
  source = "PROPERTY_FORM",
  defaultMessage = "¡Hola! Quiero que se comuniquen conmigo por este inmueble que vi en ARIZ.",
  compact = false,
  whatsappUrl,
}: LeadFormProps) {
  const targetId = propertyId ?? projectId;
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    setError(null);
    setLoading(true);

    const dni = String(form.get("dni") ?? "").trim();
    const baseMessage = String(form.get("message") ?? "").trim();
    /* El backend aun no tiene campo DNI: se anexa al mensaje para no perderlo. */
    const message = dni ? `${baseMessage}\n\nDNI: ${dni}` : baseMessage;

    try {
      await createLead({
        ...(propertyId ? { propertyId } : { projectId: projectId! }),
        source,
        name: String(form.get("name") ?? "").trim(),
        email: String(form.get("email") ?? "").trim(),
        phone: String(form.get("phone") ?? "").trim(),
        message,
      });
      formEl.reset(); // el formulario sigue visible y listo para otra consulta
      setShowSuccess(true);
    } catch {
      setError("No pudimos enviar tu consulta. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    <form
      onSubmit={handleSubmit}
      className={compact ? "mt-4 grid gap-3" : "flex flex-col gap-3 rounded-2xl border border-edge bg-surface p-6"}
    >
      <input name="email" type="email" placeholder="Email" autoComplete="email" required className={field} />

      <div className="grid grid-cols-2 gap-3">
        <input name="name" type="text" placeholder="Nombre" autoComplete="name" required className={field} />
        <input name="phone" type="tel" placeholder="Teléfono" autoComplete="tel" inputMode="tel" className={field} />
      </div>

      <input name="dni" type="text" placeholder="DNI" inputMode="numeric" maxLength={12} className={field} />

      <div className="rounded-xl border border-ink/60 px-4 pt-1.5 pb-2 transition-colors focus-within:border-[#0f6148] focus-within:ring-2 focus-within:ring-[#0f6148]/20">
        <label htmlFor={`lead-message-${targetId}`} className="block text-[11px] text-muted">
          Mensaje
        </label>
        <textarea
          id={`lead-message-${targetId}`}
          name="message"
          required
          rows={3}
          maxLength={1000}
          defaultValue={defaultMessage}
          className="w-full resize-none bg-transparent text-sm leading-6 text-ink outline-none"
        />
      </div>

      <label className="mt-1 flex items-start gap-2.5 text-xs text-ink">
        <input type="checkbox" name="terms" defaultChecked required className="mt-0.5 size-5 shrink-0 accent-[#0f6148]" />
        <span>
          Acepto los{" "}
          <Link href="/terminos" target="_blank" className="underline">
            Términos y Condiciones de Uso
          </Link>{" "}
          y las{" "}
          <Link href="/privacidad" target="_blank" className="underline">
            políticas de privacidad
          </Link>
          .
        </span>
      </label>

      <label className="flex items-start gap-2.5 text-xs text-ink">
        <input type="checkbox" name="extras" defaultChecked className="mt-0.5 size-5 shrink-0 accent-[#0f6148]" />
        <span>
          Autorizo el uso de mi información para <span className="underline">fines adicionales</span>
        </span>
      </label>

      {error ? (
        <p role="alert" className="text-xs font-semibold text-error">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0f6148] text-base font-bold text-white transition-colors hover:bg-[#0b4d3a] disabled:opacity-60"
      >
        {loading ? "Enviando..." : "Contactar"}
        {loading ? null : <MailLineIcon className="size-5" />}
      </button>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-disabled={!whatsappUrl}
        onClick={(event) => {
          if (!whatsappUrl) event.preventDefault();
        }}
        className={`flex h-12 items-center justify-center gap-2 rounded-xl bg-[#25d366] text-base font-bold text-white transition-colors hover:bg-[#1fb857] ${
          whatsappUrl ? "" : "cursor-not-allowed opacity-50 hover:bg-[#25d366]"
        }`}
      >
        Contactar por WhatsApp
        <WhatsappIcon className="size-5 shrink-0" />
      </a>
    </form>
    {showSuccess ? <SuccessModal onClose={() => setShowSuccess(false)} /> : null}
    </>
  );
}
