"use client";

import { useState, type FormEvent } from "react";
import { Mail, MessageCircle, Send, X } from "lucide-react";
import { apiClient } from "@/shared/lib/api/client";

interface AgencyPublicationContactProps {
  businessName: string;
  email: string;
  phone?: string | null;
  whatsappUrl: string;
}

const DEFAULT_REASON = "Habilitacion de publicaciones para inmobiliaria";

export function AgencyPublicationContact({
  businessName,
  email,
  phone,
  whatsappUrl,
}: AgencyPublicationContactProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(DEFAULT_REASON);
  const [message, setMessage] = useState(
    `Hola ARIZ, soy ${businessName}. Quiero coordinar la habilitacion de publicaciones para mi inmobiliaria.`,
  );
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    setError("");

    try {
      await apiClient.post("/contact-reports", {
        name: businessName,
        email,
        phone: phone?.replace(/\D/g, "").slice(-9) || undefined,
        topic: reason.trim(),
        message: message.trim(),
      });
      setSuccess(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo enviar la solicitud.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-card bg-[#128c7e] px-4 text-sm font-bold text-white shadow-[var(--shadow-card)] transition-colors hover:bg-[#0f7a6e]"
        >
          <MessageCircle className="size-4" />
          Hablar por WhatsApp
        </a>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-card border border-edge bg-surface px-4 text-sm font-bold text-ink transition-colors hover:border-brand"
        >
          {open ? <X className="size-4" /> : <Mail className="size-4" />}
          {open ? "Cerrar formulario" : "Contactar por correo"}
        </button>
      </div>

      {open ? (
        <form onSubmit={submit} className="rounded-card border border-edge bg-white p-4 shadow-[var(--shadow-card)]">
          <div className="grid gap-3">
            <label className="text-sm font-bold text-ink">
              Razon
              <input
                required
                minLength={3}
                maxLength={80}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="mt-1.5 h-11 w-full rounded-card border border-edge bg-canvas px-3 text-sm font-semibold outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
              />
            </label>
            <label className="text-sm font-bold text-ink">
              Mensaje
              <textarea
                required
                minLength={5}
                maxLength={2000}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="mt-1.5 min-h-32 w-full resize-none rounded-card border border-edge bg-canvas p-3 text-sm font-semibold leading-6 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
              />
            </label>
          </div>

          {success ? (
            <p className="mt-3 rounded-card bg-success/10 px-3 py-2 text-sm font-bold text-success">
              Solicitud enviada. Te contactaremos pronto.
            </p>
          ) : null}
          {error ? (
            <p className="mt-3 rounded-card bg-error/10 px-3 py-2 text-sm font-bold text-error">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-card bg-brand px-5 text-sm font-black text-on-brand transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Send className="size-4" />
            {submitting ? "Enviando..." : "Enviar solicitud"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
