"use client";

import { useState, type FormEvent } from "react";
import { Button, Input } from "@/shared/ui";
import { createLead } from "@/features/leads/api";
import type { LeadSource } from "@/features/leads/types/lead";

export interface LeadFormProps {
  propertyId: string;
  source?: LeadSource;
  defaultMessage?: string;
  compact?: boolean;
}

export function LeadForm({
  propertyId,
  source = "PROPERTY_FORM",
  defaultMessage = "Hola, quisiera recibir información sobre esta propiedad que vi en ARIZ.",
  compact = false,
}: LeadFormProps) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    setLoading(true);

    try {
      await createLead({
        propertyId,
        source,
        name: String(form.get("name") ?? "").trim(),
        email: String(form.get("email") ?? "").trim(),
        phone: String(form.get("phone") ?? "").trim(),
        message: String(form.get("message") ?? "").trim(),
      });
      setSent(true);
    } catch {
      setError("No pudimos enviar tu consulta. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-card border border-edge bg-brand-soft p-4 text-sm font-semibold text-brand">
        Consulta enviada. El anunciante recibirá tu mensaje.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "grid gap-3" : "flex flex-col gap-3 rounded-card border border-edge bg-surface p-6"}>
      <Input name="name" label="Nombre" placeholder="Tu nombre" required />
      <Input name="email" label="Email" type="email" placeholder="correo@ejemplo.com" required />
      <Input name="phone" label="Teléfono" placeholder="999 999 999" inputMode="tel" />
      <div className="grid gap-1.5">
        <label className="text-[13px] font-semibold text-brand">Mensaje</label>
        <textarea
          name="message"
          required
          maxLength={1000}
          defaultValue={defaultMessage}
          className="min-h-28 rounded-card border border-edge p-3 text-sm text-ink focus:border-brand focus:outline-2 focus:outline-brand/25"
        />
      </div>
      <label className="flex gap-2 text-xs text-muted">
        <input type="checkbox" required className="mt-0.5" />
        Acepto los términos y condiciones y la política de privacidad.
      </label>
      {error ? <p className="text-xs font-semibold text-error">{error}</p> : null}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Enviando..." : "CONTACTAR"}
      </Button>
    </form>
  );
}
