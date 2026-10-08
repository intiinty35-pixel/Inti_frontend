"use client";

import { useState, type FormEvent } from "react";
import { ChevronDown, Mail, Send } from "lucide-react";
import { apiClient } from "@/shared/lib/api/client";

const TOPICS = [
  "Quiero información",
  "Comprar una propiedad",
  "Vender mi propiedad",
  "Invertir con ARIZ",
  "Publicar como profesional",
  "Soporte de cuenta",
];

export function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    topic: TOPICS[0],
    message: "",
  });
  const [topicOpen, setTopicOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    setError(null);

    try {
      await apiClient.post("/contact-reports", {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        topic: form.topic,
        message: form.message.trim(),
      });
      setSuccess(true);
      setForm({
        name: "",
        email: "",
        phone: "",
        topic: TOPICS[0],
        message: "",
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo enviar la consulta.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-card border border-edge bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-card bg-brand/10 text-brand">
          <Mail className="size-5" />
        </span>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-accent">Formulario</p>
          <h2 className="text-2xl font-black text-brand">Cuéntanos qué necesitas</h2>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold text-ink">
          Nombre
          <input
            required
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="mt-1.5 h-11 w-full rounded-card border border-edge bg-white px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </label>
        <label className="text-sm font-bold text-ink">
          Correo
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="mt-1.5 h-11 w-full rounded-card border border-edge bg-white px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </label>
        <label className="text-sm font-bold text-ink">
          Teléfono
          <input
            type="tel"
            inputMode="numeric"
            maxLength={9}
            pattern="[0-9]{9}"
            title="Ingresa 9 números"
            value={form.phone}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                phone: event.target.value.replace(/\D/g, "").slice(0, 9),
              }))
            }
            className="mt-1.5 h-11 w-full rounded-card border border-edge bg-white px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </label>
        <div className="relative text-sm font-bold text-ink">
          Tema
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={topicOpen}
            onClick={() => setTopicOpen((open) => !open)}
            className="mt-1.5 flex h-11 w-full items-center justify-between gap-3 rounded-card border border-edge bg-white px-3 text-left text-sm font-semibold text-ink outline-none transition hover:border-brand focus:border-brand focus:ring-2 focus:ring-brand/15"
          >
            <span className="truncate">{form.topic}</span>
            <ChevronDown className={`size-4 shrink-0 text-brand transition ${topicOpen ? "rotate-180" : ""}`} />
          </button>
          {topicOpen ? (
            <div
              role="listbox"
              className="absolute z-20 mt-2 w-full overflow-hidden rounded-card border border-edge bg-white p-1 shadow-[var(--shadow-pop)]"
            >
              {TOPICS.map((topic) => {
                const active = form.topic === topic;

                return (
                  <button
                    key={topic}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      setForm((current) => ({ ...current, topic }));
                      setTopicOpen(false);
                    }}
                    className={`flex min-h-10 w-full items-center rounded-card px-3 text-left text-sm font-bold transition ${
                      active
                        ? "bg-brand text-on-brand"
                        : "text-ink hover:bg-brand/5 hover:text-brand"
                    }`}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
        <label className="text-sm font-bold text-ink sm:col-span-2">
          Mensaje
          <textarea
            required
            value={form.message}
            onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
            className="mt-1.5 min-h-32 w-full rounded-card border border-edge bg-white p-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </label>
      </div>

      {success ? (
        <p className="mt-5 rounded-card bg-success/10 p-3 text-sm font-bold text-success">
          Consulta enviada. Te contactaremos pronto.
        </p>
      ) : null}
      {error ? (
        <p className="mt-5 rounded-card bg-error/10 p-3 text-sm font-bold text-error">
          {error}
        </p>
      ) : null}

      <button
        disabled={submitting}
        className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-card bg-brand px-5 text-sm font-black text-on-brand hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Send className="size-4" />
        {submitting ? "Enviando..." : "Enviar consulta"}
      </button>
    </form>
  );
}
