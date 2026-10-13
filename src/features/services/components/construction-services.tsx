"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import {
  ClipboardCheck,
  Expand,
  FileCheck,
  Hammer,
  HardHat,
  Mail,
  MapPinned,
  MessageCircle,
  PaintRoller,
  PencilRuler,
  Route,
  Ruler,
  Send,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ServiceImage } from "@/features/services/components/service-image";
import { apiClient } from "@/shared/lib/api/client";
import { buildArizManagerWhatsappUrl } from "@/shared/lib/whatsapp";

interface ConstructionService {
  title: string;
  text: string;
  icon: LucideIcon;
  image: string;
}

const unsplash = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

const CONSTRUCTION_SERVICES: readonly ConstructionService[] = [
  {
    title: "Diseño y arquitectura",
    text: "Diseño de planos arquitectónicos, diseño y rediseño de viviendas, distribución de ambientes, fachadas modernas, proyectos 3D, renders y diseño de interiores.",
    icon: PencilRuler,
    image: unsplash("photo-1503387762-592deb58ef4e"),
  },
  {
    title: "Ingeniería y expedientes técnicos",
    text: "Planos estructurales, instalaciones eléctricas y sanitarias, estudios de suelos, metrados, presupuestos, especificaciones técnicas y expedientes de obra.",
    icon: Ruler,
    image: unsplash("photo-1581094794329-c8112a89af12"),
  },
  {
    title: "Construcción de viviendas y edificaciones",
    text: "Construcción de casas, departamentos, edificios multifamiliares, locales comerciales, oficinas, almacenes y proyectos residenciales.",
    icon: HardHat,
    image: unsplash("photo-1504307651254-35680f356dfd"),
  },
  {
    title: "Remodelación y rediseño de inmuebles",
    text: "Remodelaciones integrales, modernización de fachadas, redistribución de ambientes, renovación de cocinas y baños, adecuación de locales y mejoras funcionales.",
    icon: Hammer,
    image: unsplash("photo-1581578731548-c64695cc6952"),
  },
  {
    title: "Ampliaciones y modificaciones estructurales",
    text: "Ampliación de viviendas, construcción de segundos pisos, ampliaciones de ambientes, reforzamiento estructural y adecuaciones, previa evaluación técnica.",
    icon: Expand,
    image: unsplash("photo-1541888946425-d81bb19240f5"),
  },
  {
    title: "Acabados y diseño de interiores",
    text: "Instalación de porcelanatos y cerámicos, drywall, cielos rasos, pintura, carpintería, puertas, ventanas, revestimientos e iluminación decorativa.",
    icon: PaintRoller,
    image: unsplash("photo-1560518883-ce09059eeffa"),
  },
  {
    title: "Instalaciones eléctricas y sanitarias",
    text: "Sistemas eléctricos, tableros, iluminación, redes de agua potable, desagüe, cisternas, tanques elevados, bombeo e instalaciones sanitarias.",
    icon: Zap,
    image: unsplash("photo-1589829545856-d10d557cf95f"),
  },
  {
    title: "Obras civiles y habilitación urbana",
    text: "Construcción de pistas, veredas, sardineles, cercos perimétricos, pórticos, redes de servicios básicos, parques y áreas comunes.",
    icon: Route,
    image: unsplash("photo-1486406146926-c627a92ad1ab"),
  },
  {
    title: "Topografía y estudios de terrenos",
    text: "Levantamientos topográficos, nivelación, replanteo, delimitación de terrenos, movimiento de tierras y estudios preliminares para construcción.",
    icon: MapPinned,
    image: unsplash("photo-1450101499163-c8848c66ca85"),
  },
  {
    title: "Trámites y regularización de construcciones",
    text: "Elaboración de documentación para licencias de edificación, declaratoria de fábrica o edificación, conformidad de obra, regularizaciones y asistencia técnica municipal.",
    icon: FileCheck,
    image: unsplash("photo-1460925895917-afdab827c52f"),
  },
  {
    title: "Supervisión y gestión de obras",
    text: "Dirección técnica, supervisión de construcción, control de calidad, cronogramas, presupuestos, valorizaciones y administración de proyectos.",
    icon: ClipboardCheck,
    image: unsplash("photo-1503174971373-b1f69850bded"),
  },
  {
    title: "Mantenimiento y rehabilitación",
    text: "Reparaciones generales, impermeabilización, mantenimiento de infraestructura, tratamiento de humedad, renovación de fachadas y rehabilitación de inmuebles.",
    icon: Wrench,
    image: unsplash("photo-1560520653-9e0e4c89eb11"),
  },
];

const INPUT_CLASS =
  "mt-1.5 h-11 w-full rounded-card border border-edge bg-white px-3 text-sm font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/15";

export function ConstructionServices() {
  const [emailFor, setEmailFor] = useState<ConstructionService | null>(null);

  return (
    <>
      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {CONSTRUCTION_SERVICES.map((service, index) => {
          const Icon = service.icon;
          return (
            <li
              key={service.title}
              className="flex flex-col overflow-hidden rounded-2xl border border-edge bg-surface shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-1 hover:border-brand"
            >
              <div className="relative h-48">
                <ServiceImage src={service.image} alt="" className="absolute inset-0 size-full" />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent"
                />
                <span className="absolute left-4 top-4 flex size-12 items-center justify-center rounded-card bg-accent text-on-accent shadow-lg">
                  <Icon className="size-6" strokeWidth={2.3} aria-hidden="true" />
                </span>
                <span className="absolute right-4 top-4 text-sm font-black text-white/90">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-xl font-black leading-tight text-brand">
                  {index + 1}. {service.title}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-muted">{service.text}</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <a
                    href={buildArizManagerWhatsappUrl(
                      `Hola ARIZ Proyectos, quiero cotizar el servicio de ${service.title}.`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-card bg-[#25D366] px-3 text-sm font-black text-white transition hover:brightness-95"
                  >
                    <MessageCircle className="size-4" aria-hidden="true" />
                    WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => setEmailFor(service)}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-card bg-brand px-3 text-sm font-black text-on-brand transition hover:bg-brand-hover"
                  >
                    <Mail className="size-4" aria-hidden="true" />
                    Correo
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {emailFor ? <EmailModal service={emailFor} onClose={() => setEmailFor(null)} /> : null}
    </>
  );
}

function EmailModal({ service, onClose }: { service: ConstructionService; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.post("/contact-reports", {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        topic: `Construcción: ${service.title}`.slice(0, 80),
        message: form.message.trim(),
      });
      setSuccess(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo enviar la consulta.");
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="construction-mail-title"
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl border-t-4 border-accent bg-surface p-6 text-ink shadow-2xl sm:p-7"
      >
        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full text-muted transition hover:bg-brand-soft hover:text-brand"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Contáctanos por correo</p>
        <h3 id="construction-mail-title" className="mt-2 pr-8 text-xl font-black leading-tight text-brand">
          {service.title}
        </h3>

        {success ? (
          <div className="mt-5">
            <p className="rounded-card bg-success/10 p-3 text-sm font-bold text-success">
              Consulta enviada. Te contactaremos pronto.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 h-11 rounded-card bg-brand px-5 text-sm font-black text-on-brand hover:bg-brand-hover"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 grid gap-4">
            <label className="text-sm font-bold text-ink">
              Nombre
              <input
                required
                maxLength={120}
                value={form.name}
                onChange={(event) => setForm((c) => ({ ...c, name: event.target.value }))}
                className={INPUT_CLASS}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold text-ink">
                Correo
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((c) => ({ ...c, email: event.target.value }))}
                  className={INPUT_CLASS}
                />
              </label>
              <label className="text-sm font-bold text-ink">
                Teléfono
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={9}
                  pattern="9[0-9]{8}"
                  title="Celular de 9 números que empiece con 9"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((c) => ({ ...c, phone: event.target.value.replace(/\D/g, "").slice(0, 9) }))
                  }
                  className={INPUT_CLASS}
                />
              </label>
            </div>
            <label className="text-sm font-bold text-ink">
              Mensaje
              <textarea
                required
                minLength={5}
                maxLength={2000}
                value={form.message}
                onChange={(event) => setForm((c) => ({ ...c, message: event.target.value }))}
                placeholder="Cuéntanos qué necesitas"
                className="mt-1.5 min-h-28 w-full rounded-card border border-edge bg-white p-3 text-sm font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
              />
            </label>
            {error ? <p className="rounded-card bg-error/10 p-3 text-sm font-bold text-error">{error}</p> : null}
            <button
              disabled={submitting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-card bg-brand px-5 text-sm font-black text-on-brand hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Send className="size-4" aria-hidden="true" />
              {submitting ? "Enviando..." : "Enviar consulta"}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
