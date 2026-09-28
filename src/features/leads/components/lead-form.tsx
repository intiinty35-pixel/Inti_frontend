"use client";

import { useState, type FormEvent } from "react";
import { Button, Input } from "@/shared/ui";
<<<<<<< HEAD

export interface LeadFormProps {
  source: string;
  listingId?: string;
}

export function LeadForm({ source, listingId }: LeadFormProps) {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
=======
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
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
  }

  if (sent) {
    return (
<<<<<<< HEAD
      <div className="rounded-card border border-edge bg-surface p-6 text-sm text-ink">
        Thank you, an advisor will contact you soon.
=======
      <div className="rounded-card border border-edge bg-brand-soft p-4 text-sm font-semibold text-brand">
        Consulta enviada. El anunciante recibirá tu mensaje.
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-card border border-edge bg-surface p-6"
    >
      <Input name="name" label="Name" placeholder="Your name" required />
      <Input name="phone" label="Phone" placeholder="999 999 999" inputMode="tel" required />
      <Input name="email" label="Email" type="email" placeholder="you@mail.com" />
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="listingId" value={listingId ?? ""} />
      <Button type="submit">Request information</Button>
    </form>
  );
}
=======
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
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
