"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ArrowRightIcon, CheckIcon, Container } from "@/shared/ui";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/cn";
import { apiClient } from "@/shared/lib/api/client";
import {
  Building2,
  Briefcase,
  ClipboardList,
  Hammer,
  KeyRound,
  Landmark,
  Megaphone,
  Scale,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { buildServiceWhatsappUrl } from "@/features/services/config";
import { FinanceCarousel } from "@/features/services/components/finance-carousel";
import { RevealOnScroll } from "@/features/services/components/reveal-on-scroll";
import { ServiceImage } from "@/features/services/components/service-image";

const COMMERCIAL_SERVICES = [
  "Corretaje inmobiliario",
  "Asesoria inmobiliaria",
  "Venta de proyectos inmobiliarios",
  "Venta de terrenos, casas, departamentos y locales",
  "Captacion y seguimiento de prospectos",
  "Estrategia comercial y de precios",
  "Marketing inmobiliario",
  "Negociacion y cierre de operaciones",
] as const;

const LEGAL_ITEMS = [
  "Contratos de compraventa",
  "Partidas registrales",
  "Titulos de propiedad",
  "Saneamiento fisico-legal",
  "Independizaciones",
  "Tramites notariales",
  "Tramites registrales",
  "Parametros urbanisticos",
  "Habilitacion urbana",
  "Licencias",
] as const;

const EVALUATION_AREAS = [
  { title: "Valor comercial", text: "Cuanto vale actualmente tu propiedad." },
  { title: "Potencial inmobiliario", text: "Que tipo de proyecto podria desarrollarse." },
  { title: "Zonificacion y parametros", text: "Que permite desarrollar o construir la normativa aplicable." },
  { title: "Situacion registral", text: "Si la propiedad esta correctamente inscrita y libre de observaciones relevantes." },
  { title: "Rentabilidad", text: "Si conviene vender, desarrollar o evaluar una posible asociacion." },
] as const;

const FINANCE_ITEMS = [
  "Creditos hipotecarios",
  "Creditos directos",
  "Capacidad financiera",
  "Evaluacion tributaria",
  "Costos del proyecto",
  "Flujo de caja",
  "Rentabilidad",
  "SUNAT",
  "Reportes financieros",
  "Estructuracion financiera",
] as const;

const DEVELOPMENT_STEPS = [
  "Evaluamos el terreno",
  "Analizamos la viabilidad",
  "Revisamos zonificacion y parametros",
  "Gestionamos permisos municipales",
  "Coordinamos especialistas",
  "Preparamos la estrategia de marketing",
  "Implementamos el equipo de ventas",
  "Acompanamos el cierre y la postventa",
] as const;

const DEVELOPMENT_IMAGES = [
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&w=900&q=80",
] as const;

const SERVICE_CARDS: readonly {
  title: string;
  href: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Corretaje inmobiliario",
    href: "#corretaje-inmobiliario",
    icon: KeyRound,
  },
  {
    title: "Asesoria inmobiliaria",
    href: "#corretaje-inmobiliario",
    icon: Briefcase,
  },
  {
    title: "Asesoria legal",
    href: "#asesoria-legal",
    icon: Scale,
  },
  {
    title: "Promotoria y gestion de proyectos urbanos",
    href: "#promotoria-gestion",
    icon: ClipboardList,
  },
  {
    title: "Desarrollo de proyectos urbanos",
    href: "#desarrollo-proyectos-urbanos",
    icon: Hammer,
  },
  {
    title: "Marketing inmobiliario",
    href: "#marketing-inmobiliario",
    icon: Megaphone,
  },
  {
    title: "Administramos condominios, edificios y alquileres",
    href: "#administracion-condominios",
    icon: Building2,
  },
  {
    title: "Servicio de cobranza inmobiliaria",
    href: "#cobranza-inmobiliaria",
    icon: Wallet,
  },
  {
    title: "Asesoria financiera, creditos hipotecarios y creditos directos",
    href: "#asesoria-financiera",
    icon: Landmark,
  },
] as const;

const FINAL_ACTIONS = [
  {
    title: "Tengo un terreno",
    text: "Quiero conocer su valor y potencial.",
    service: "Desarrollo de proyectos urbanos",
  },
  {
    title: "Tengo una propiedad",
    text: "Quiero venderla con asesoria profesional.",
    service: "Corretaje inmobiliario",
  },
  {
    title: "Tengo un proyecto inmobiliario",
    text: "Necesito estructurarlo o formar un equipo comercial.",
    service: "Promotoria y gestion de proyectos urbanos",
  },
] as const;

const INPUT_CLASS =
  "mt-1.5 h-11 w-full rounded-card border border-edge bg-white px-3 text-sm font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/15";

function WhatsappCta({
  service,
  variant = "primary",
}: {
  service: string;
  variant?: "primary" | "secondary" | "accent";
}) {
  return (
    <a
      href={buildServiceWhatsappUrl(service)}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-card px-5 text-sm font-bold transition-colors",
        variant === "primary" && "bg-brand text-on-brand hover:bg-brand-hover",
        variant === "secondary" && "border border-edge bg-surface text-brand hover:border-brand",
        variant === "accent" && "bg-accent text-on-accent hover:bg-accent-hover",
      )}
    >
      Consultar por WhatsApp
      <ArrowRightIcon className="size-4" />
    </a>
  );
}

function ConsultationButton({
  service,
  onOpen,
  variant = "secondary",
}: {
  service: string;
  onOpen: (service: string) => void;
  variant?: "secondary" | "accent";
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(service)}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-card px-5 text-sm font-bold transition-colors",
        variant === "secondary" && "border border-edge bg-surface text-brand hover:border-brand",
        variant === "accent" && "bg-accent text-on-accent hover:bg-accent-hover",
      )}
    >
      Dejar mi consulta
      <ArrowRightIcon className="size-4" />
    </button>
  );
}

function ServiceActions({
  service,
  onOpen,
  whatsappVariant = "primary",
  consultationVariant = "secondary",
}: {
  service: string;
  onOpen: (service: string) => void;
  whatsappVariant?: "primary" | "secondary" | "accent";
  consultationVariant?: "secondary" | "accent";
}) {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <WhatsappCta service={service} variant={whatsappVariant} />
      <ConsultationButton service={service} onOpen={onOpen} variant={consultationVariant} />
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  text,
  center = false,
  light = false,
  eyebrowClassName,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  center?: boolean;
  light?: boolean;
  eyebrowClassName?: string;
}) {
  return (
    <div className={cn("max-w-3xl", center && "mx-auto text-center")}>
      {eyebrow ? (
        <p
          className={cn(
            "text-[11px] font-bold uppercase tracking-[0.18em]",
            light ? "text-accent" : "text-accent",
            eyebrowClassName,
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2 className={cn("mt-3 text-3xl font-bold tracking-tight sm:text-4xl", light ? "text-white" : "text-brand")}>
        {title}
      </h2>
      {text ? (
        <p className={cn("mt-4 text-sm leading-relaxed sm:text-base", light ? "text-white/78" : "text-muted")}>
          {text}
        </p>
      ) : null}
    </div>
  );
}

function SocialIcon({ name }: { name: "TikTok" | "Facebook" | "Instagram" | "YouTube" | "LinkedIn" }) {
  const common = {
    "aria-hidden": true as const,
    className: "size-5 fill-current",
    viewBox: "0 0 24 24",
  };

  switch (name) {
    case "TikTok":
      return (
        <svg {...common}>
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07Z" />
        </svg>
      );
    case "Facebook":
      return (
        <svg {...common}>
          <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103.513.06.927.136 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.673 3.667h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
        </svg>
      );
    case "Instagram":
      return (
        <svg {...common}>
          <path d="M7.03.084C5.753.144 4.881.348 4.119.647c-.789.308-1.457.72-2.123 1.388-.665.668-1.075 1.337-1.38 2.127-.296.764-.496 1.637-.552 2.914C.007 8.354-.005 8.764.001 12.023c.006 3.259.021 3.667.083 4.947.061 1.277.264 2.149.563 2.911.308.789.72 1.457 1.388 2.123.668.665 1.337 1.074 2.128 1.38.763.295 1.636.496 2.913.552 1.277.056 1.688.069 4.946.063 3.258-.007 3.668-.021 4.948-.082 1.28-.061 2.147-.265 2.91-.563.789-.309 1.457-.72 2.123-1.388.665-.668 1.074-1.338 1.379-2.128.296-.763.497-1.636.552-2.912.056-1.281.069-1.69.063-4.948-.006-3.258-.021-3.667-.082-4.947-.061-1.28-.264-2.149-.563-2.912-.308-.789-.72-1.457-1.388-2.123-.668-.665-1.338-1.074-2.128-1.379C19.074.321 18.202.12 16.924.065 15.647.009 15.236-.005 11.977.001 8.718.008 8.31.022 7.03.084ZM5.839 12.012c.007 3.403 2.771 6.156 6.173 6.149 3.403-.006 6.157-2.77 6.151-6.173-.007-3.403-2.771-6.157-6.174-6.15-3.403.007-6.157 2.771-6.15 6.174ZM8 12.008a4 4 0 1 1 4.008 3.992A4 4 0 0 1 8 12.008Z" />
        </svg>
      );
    case "YouTube":
      return (
        <svg {...common}>
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.016 3.016 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.121 2.136c1.872.505 9.377.505 9.377.505s7.505 0 9.376-.505a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
        </svg>
      );
    case "LinkedIn":
      return (
        <svg {...common} viewBox="0 0 448 512">
          <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3C448 46.5 433.6 32 416 32ZM135.4 416H69V202.2h66.5V416Zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5ZM384.3 416h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416Z" />
        </svg>
      );
  }
}

export function ServicesSection() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const servicesCarouselRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef({ isDragging: false, startX: 0, scrollLeft: 0 });

  useEffect(() => {
    const carousel = servicesCarouselRef.current;
    if (!carousel) return;

    const interval = window.setInterval(() => {
      const firstCard = carousel.querySelector<HTMLElement>("[data-service-card]");
      const step = firstCard ? firstCard.offsetWidth + 12 : carousel.clientWidth;
      const nearEnd = carousel.scrollLeft + carousel.clientWidth + step >= carousel.scrollWidth;

      carousel.scrollTo({
        left: nearEnd ? 0 : carousel.scrollLeft + step,
        behavior: "smooth",
      });
    }, 10000);

    return () => window.clearInterval(interval);
  }, []);

  function handleCarouselWheel(event: React.WheelEvent<HTMLDivElement>) {
    const carousel = servicesCarouselRef.current;
    if (!carousel) return;
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

    event.preventDefault();
    carousel.scrollLeft += event.deltaY;
  }

  function handleDragStart(event: React.PointerEvent<HTMLDivElement>) {
    const carousel = servicesCarouselRef.current;
    if (!carousel) return;
    if ((event.target as HTMLElement).closest("a, button")) return;

    dragStateRef.current = {
      isDragging: true,
      startX: event.clientX,
      scrollLeft: carousel.scrollLeft,
    };
    carousel.setPointerCapture(event.pointerId);
  }

  function handleDragMove(event: React.PointerEvent<HTMLDivElement>) {
    const carousel = servicesCarouselRef.current;
    const dragState = dragStateRef.current;
    if (!carousel || !dragState.isDragging) return;

    carousel.scrollLeft = dragState.scrollLeft - (event.clientX - dragState.startX);
  }

  function handleDragEnd(event: React.PointerEvent<HTMLDivElement>) {
    const carousel = servicesCarouselRef.current;
    dragStateRef.current.isDragging = false;
    if (carousel?.hasPointerCapture(event.pointerId)) {
      carousel.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <section id="servicios" className="ariz-services bg-canvas">
      <Container size="wide-tight" className="pt-8 sm:pt-10">
        <div
          ref={servicesCarouselRef}
          onWheel={handleCarouselWheel}
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
          className="horizontal-scrollbar-hidden grid cursor-grab auto-cols-[72vw] touch-pan-x select-none grid-flow-col grid-rows-1 gap-3 overflow-x-auto scroll-smooth pb-3 active:cursor-grabbing sm:auto-cols-[250px] lg:auto-cols-[280px]"
        >
          {SERVICE_CARDS.map((service) => (
            <RevealOnScroll key={service.title}>
              <article
                data-service-card
                className="flex h-full min-h-40 flex-col items-center justify-center rounded-card border border-[#25D366] bg-surface p-4 text-center shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:border-[#128C7E] sm:min-h-44 sm:p-5"
              >
                <h3 className="text-sm font-black uppercase leading-5 text-brand sm:text-base sm:leading-6">
                  {service.title}
                </h3>
                <span className="mt-3 flex size-11 items-center justify-center rounded-card bg-brand text-on-brand shadow-[0_8px_18px_rgb(7_26_90_/_0.14)]">
                  <service.icon className="size-5" strokeWidth={2.2} aria-hidden="true" />
                </span>
                <div className="mt-5 grid w-full gap-2">
                  <a
                    href={buildServiceWhatsappUrl(service.title)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center justify-center rounded-card bg-accent px-4 text-sm font-black text-on-accent transition hover:bg-accent-hover"
                  >
                    Consultar
                  </a>
                  <a
                    href={service.href}
                    className="inline-flex h-10 items-center justify-center rounded-card border border-brand px-4 text-sm font-black text-brand transition hover:bg-brand hover:text-on-brand"
                  >
                    Conocer
                  </a>
                </div>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </Container>

      <Container size="wide-tight" className="pt-8">
        <RevealOnScroll>
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-accent">Detalle de servicios</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-brand sm:text-4xl">
              Acompanamiento especializado
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
              Conservamos la informacion ampliada para revisar cada linea de servicio con mayor detalle.
            </p>
          </div>
        </RevealOnScroll>
      </Container>

      <Container id="corretaje-inmobiliario" size="wide-tight" className="py-12 sm:py-16">
        <RevealOnScroll>
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="font-display text-2xl font-black tracking-tight text-accent sm:text-3xl">
                Corretaje y asesoria inmobiliaria
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-brand sm:text-4xl">
                Vendemos tu proyecto o propiedad
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                Gestionamos la compra, venta y alquiler de propiedades mediante estrategias comerciales, promocion,
                valorizacion y negociacion. Conectamos propietarios, compradores e inversionistas para concretar
                operaciones seguras y eficientes.
              </p>

              <div className="mt-8 rounded-2xl border border-edge bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
                <div className="grid gap-2 sm:grid-cols-2">
                  {COMMERCIAL_SERVICES.map((item, index) => (
                    <div
                      key={item}
                      className="group flex items-start gap-3 rounded-card bg-canvas px-3 py-3 transition-colors hover:bg-brand-soft"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-black text-on-brand">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm font-semibold leading-6 text-ink">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <ServiceActions service="Corretaje inmobiliario" onOpen={setSelectedService} />
            </div>
            <div className="relative">
              <ServiceImage src="/servicios/servicios.png" alt="Equipo comercial inmobiliario de ARIZ" className="h-80 rounded-2xl lg:h-[460px]" />
              <div className="absolute inset-x-5 bottom-5 rounded-card bg-white/92 p-5 shadow-[var(--shadow-card)] backdrop-blur">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-accent">Fuerza comercial</p>
                <p className="mt-2 text-xl font-black text-brand">
                  ARIZ puede asumir la venta y seguimiento comercial de tu proyecto.
                </p>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </Container>

      <section id="asesoria-legal" className="bg-surface py-14 sm:py-18">
        <Container size="wide-tight">
          <RevealOnScroll>
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div>
                <SectionHeading
                  eyebrow="Asesoria legal inmobiliaria"
                  eyebrowClassName="text-base sm:text-lg"
                  title="Compra, vende o desarrolla con respaldo legal"
                  text="Brindamos asesoramiento en contratos, partidas registrales, titulos de propiedad, saneamiento fisico-legal, independizaciones y tramites notariales y registrales."
                />
                <blockquote className="mt-8 border-l-4 border-accent bg-canvas px-5 py-4 text-lg font-black leading-7 text-brand">
                  Revisamos la situacion legal del inmueble antes de que tomes una decision.
                </blockquote>
                <ServiceActions service="Asesoria legal" onOpen={setSelectedService} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {LEGAL_ITEMS.slice(0, 8).map((item, index) => (
                  <div
                    key={item}
                    className={cn(
                      "group relative min-h-24 rounded-card border border-edge bg-canvas p-4 shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:border-brand",
                      index >= 4 && "lg:translate-x-3",
                    )}
                  >
                    <span
                      className="absolute left-3 top-3 size-2 rounded-full bg-accent shadow-[0_0_0_4px_rgb(245_184_0_/_0.14)]"
                      aria-hidden
                    />
                    <p className="pl-4 text-sm font-black leading-5 text-brand">{item}</p>
                  </div>
                ))}
                <div className="rounded-card border border-edge bg-brand p-3 text-white shadow-[var(--shadow-card)] sm:col-span-2 lg:col-span-4">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {LEGAL_ITEMS.slice(8).map((item) => (
                      <div key={item} className="rounded-card bg-white/8 px-3 py-2">
                        <span className="mr-2 inline-block size-2 rounded-full bg-accent align-middle" aria-hidden />
                        <span className="text-sm font-black leading-5 text-white">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </Container>
      </section>

      <Container id="desarrollo-proyectos-urbanos" size="wide-tight" className="py-16 sm:py-20">
        <RevealOnScroll>
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
            <div className="relative">
              <ServiceImage
                src="/servicios/image.png"
                alt="Evaluacion de terrenos para desarrollo inmobiliario"
                className="h-80 rounded-2xl border border-edge shadow-[var(--shadow-card)] lg:h-[460px]"
                imgClassName="object-cover object-center transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-x-5 bottom-5 rounded-card bg-white/92 p-5 shadow-[var(--shadow-card)] backdrop-blur">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-accent">Analisis integral</p>
                <p className="mt-2 text-xl font-black leading-tight text-brand">
                  Valor comercial, potencial constructivo y viabilidad antes de invertir.
                </p>
              </div>
            </div>
            <div className="flex min-h-[460px] flex-col justify-center">
              <p className="font-display text-2xl font-black tracking-tight text-accent sm:text-3xl">
                Desarrollo de proyectos urbanos
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-brand sm:text-4xl">
                Tienes un terreno y no sabes cuanto vale o que puedes desarrollar?
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                Evaluamos el potencial de terrenos considerando zonificacion, parametros urbanisticos, habilitaciones
                urbanas, factibilidad y oportunidades de inversion.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {EVALUATION_AREAS.map((area) => (
                  <div key={area.title} className="rounded-card border border-edge bg-surface p-3 shadow-[var(--shadow-card)]">
                    <span className="flex items-center gap-2 text-sm font-black text-brand">
                      <CheckIcon className="size-4 shrink-0 text-accent" strokeWidth={2.6} />
                      {area.title}
                    </span>
                    <p className="mt-2 text-xs font-semibold leading-5 text-muted">{area.text}</p>
                  </div>
                ))}
              </div>
              <ServiceActions service="Desarrollo de proyectos urbanos" onOpen={setSelectedService} />
            </div>
          </div>
        </RevealOnScroll>
      </Container>

      <section id="marketing-inmobiliario" className="bg-surface py-14 sm:py-18">
        <Container size="wide-tight">
          <RevealOnScroll>
            <div className="grid gap-8 rounded-card border border-edge bg-canvas p-6 shadow-[var(--shadow-card)] lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:p-8">
              <div>
                <p className="font-display text-2xl font-black tracking-tight text-accent sm:text-3xl">
                  Marketing inmobiliario
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-brand sm:text-4xl">
                  Promocionamos propiedades en redes sociales
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
                  Creamos campanas para TikTok, Facebook, Instagram, YouTube y LinkedIn, con piezas visuales,
                  publicaciones, pauta y seguimiento comercial para captar clientes potenciales y mejorar las
                  oportunidades de venta.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {(["TikTok", "Facebook", "Instagram", "YouTube", "LinkedIn"] as const).map((name) => (
                    <span
                      key={name}
                      className="inline-flex h-10 items-center gap-2 rounded-card border border-edge bg-surface px-3 text-sm font-black text-brand"
                    >
                      <SocialIcon name={name} />
                      {name}
                    </span>
                  ))}
                </div>
                <ServiceActions service="Marketing inmobiliario" onOpen={setSelectedService} />
              </div>
              <div className="overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)]">
                <Image
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPl-lnkWQtzqEoYr762YCeC4bj6Sz-aEpoUvkCVATHGy9zGctIJHfU4CI&s=10"
                  alt="Marketing inmobiliario en redes sociales"
                  width={900}
                  height={640}
                  className="h-72 w-full object-cover sm:h-96"
                />
              </div>
            </div>
          </RevealOnScroll>
        </Container>
      </section>

      <section id="asesoria-financiera" className="bg-surface py-14 sm:py-18">
        <Container size="wide-tight">
          <RevealOnScroll>
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
              <div>
                <p className="font-display text-2xl font-black tracking-tight text-accent sm:text-3xl">
                  Asesoria financiera y creditos
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-brand sm:text-5xl">
                  Los numeros tambien forman parte del proyecto
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                  Asesoramos en alternativas de financiamiento para adquirir propiedades, incluyendo creditos
                  hipotecarios, creditos directos y analisis de capacidad financiera.
                </p>
                <ServiceActions service="Asesoria financiera, creditos hipotecarios y creditos directos" onOpen={setSelectedService} />
              </div>
              <FinanceCarousel items={FINANCE_ITEMS} />
            </div>
          </RevealOnScroll>
        </Container>
      </section>

      <Container id="promotoria-gestion" size="wide-tight" className="py-16 sm:py-20">
        <RevealOnScroll>
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-display text-3xl font-black tracking-tight text-accent sm:text-4xl">
              Promotoria y gestion de proyectos urbanos
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-brand sm:text-5xl">
              De un terreno a un proyecto inmobiliario
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              Coordinamos la planificacion, promocion y gestion de proyectos inmobiliarios, incluyendo evaluaciones de
              viabilidad, tramites municipales, permisos y coordinacion con especialistas.
            </p>
          </div>
          <div className="horizontal-scrollbar-hidden mt-10 flex gap-4 overflow-x-auto pb-2">
            {DEVELOPMENT_STEPS.map((step, index) => (
              <article
                key={step}
                className="group relative w-56 shrink-0 overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:border-brand"
              >
                <div className="relative">
                  <ServiceImage
                    src={DEVELOPMENT_IMAGES[index]}
                    alt={step}
                    className="h-32 w-full"
                    imgClassName="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-brand/65 to-transparent" aria-hidden />
                </div>
                <div className="p-4">
                  <span className="mb-3 block h-1 w-10 rounded-full bg-accent" aria-hidden />
                  <p className="text-sm font-black leading-5 text-brand">{step}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <ServiceActions service="Promotoria y gestion de proyectos urbanos" onOpen={setSelectedService} />
          </div>
        </RevealOnScroll>
      </Container>

      <section id="administracion-condominios" className="bg-surface pt-14 pb-8 sm:pt-18 sm:pb-10">
        <Container size="wide-tight">
          <RevealOnScroll>
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div className="overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)]">
                <Image
                  src="https://www.elemprendedor.pe/media/2024/05/condominio-1.jpg"
                  alt="Administracion de condominios y edificios"
                  width={900}
                  height={620}
                  className="h-72 w-full object-cover sm:h-96"
                />
              </div>
              <div>
                <p className="font-display text-2xl font-black tracking-tight text-accent sm:text-3xl">
                  Administracion de condominios, edificios y alquileres
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-brand sm:text-4xl">
                  Gestionamos la operacion diaria de tus propiedades
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
                  Ofrecemos administracion integral con mantenimiento, control de pagos, gestion de proveedores,
                  atencion de incidencias y supervision de propiedades.
                </p>
                <ServiceActions service="Administracion de condominios, edificios y alquileres" onOpen={setSelectedService} />
              </div>
            </div>
          </RevealOnScroll>
        </Container>
      </section>

      <section id="cobranza-inmobiliaria" className="bg-canvas pt-8 pb-14 sm:pt-10 sm:pb-18">
        <Container size="wide-tight">
          <RevealOnScroll>
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <p className="font-display text-2xl font-black tracking-tight text-accent sm:text-3xl">
                  Servicio de cobranza inmobiliaria
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-brand sm:text-4xl">
                  Ordenamos el seguimiento de pagos
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
                  Gestionamos el seguimiento y control de pagos relacionados con alquileres, cuotas y obligaciones
                  inmobiliarias para una administracion ordenada y eficiente.
                </p>
                <ServiceActions service="Servicio de cobranza inmobiliaria" onOpen={setSelectedService} />
              </div>
              <div className="overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)]">
                <Image
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjh6mQbJkaV446mqAMZFzQ-Q5RG8dLBiQf1q6iAweWUw&s=10"
                  alt="Servicio de cobranza inmobiliaria"
                  width={900}
                  height={620}
                  className="h-72 w-full object-cover sm:h-96"
                />
              </div>
            </div>
          </RevealOnScroll>
        </Container>
      </section>

      <section id="contacto" className="bg-brand py-14 text-white sm:py-16">
        <Container size="wide-tight">
          <RevealOnScroll>
            <SectionHeading
              eyebrow="Conversemos"
              title="Que necesitas hacer?"
              text="Elige el punto de partida y conversemos con el especialista adecuado."
              center
              light
            />
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {FINAL_ACTIONS.map((action) => (
                <article key={action.title} className="rounded-card border border-white/15 bg-white/8 p-5 text-center">
                  <h3 className="text-lg font-black uppercase tracking-[0.1em] text-white">{action.title}</h3>
                  <p className="mx-auto mt-3 max-w-64 text-sm leading-6 text-white/75">{action.text}</p>
                  <div className="mt-6">
                    <a
                      href={buildServiceWhatsappUrl(action.service)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 items-center justify-center rounded-card bg-accent px-5 text-sm font-black text-on-accent transition hover:bg-accent-hover"
                    >
                      Consultar
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </RevealOnScroll>
        </Container>
      </section>

      {selectedService ? (
        <ServiceConsultationModal service={selectedService} onClose={() => setSelectedService(null)} />
      ) : null}
    </section>
  );
}

function ServiceConsultationModal({ service, onClose }: { service: string; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", company: "", phone: "", email: "", message: "" });
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
      const message = [
        `Servicio de interes: ${service}`,
        form.company.trim() ? `Empresa: ${form.company.trim()}` : null,
        "",
        form.message.trim(),
      ]
        .filter((item): item is string => item !== null)
        .join("\n");

      await apiClient.post("/contact-reports", {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        topic: service.slice(0, 80),
        message,
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
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-brand/45 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-consultation-title"
        className="relative w-full max-w-lg rounded-card border border-edge bg-surface p-6 text-ink shadow-[var(--shadow-pop)] sm:p-7"
      >
        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full text-muted transition hover:bg-brand-soft hover:text-brand"
        >
          x
        </button>

        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-accent">Dejar mi consulta</p>
        <h3 id="service-consultation-title" className="mt-2 pr-8 text-2xl font-black leading-tight text-brand">
          {service}
        </h3>

        {success ? (
          <div className="mt-5">
            <p className="rounded-card bg-success/10 p-4 text-sm font-bold text-success">
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
              Nombre completo
              <input
                required
                maxLength={120}
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className={INPUT_CLASS}
              />
            </label>

            <label className="text-sm font-bold text-ink">
              Empresa
              <input
                maxLength={120}
                value={form.company}
                onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
                className={INPUT_CLASS}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold text-ink">
                Telefono
                <input
                  required
                  type="tel"
                  inputMode="numeric"
                  maxLength={9}
                  pattern="9[0-9]{8}"
                  title="Celular de 9 numeros que empiece con 9"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      phone: event.target.value.replace(/\D/g, "").slice(0, 9),
                    }))
                  }
                  className={INPUT_CLASS}
                />
              </label>
              <Input
                label="Correo electronico"
                required
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              />
            </div>

            <label className="text-sm font-bold text-ink">
              Servicio de interes
              <input value={service} readOnly className={`${INPUT_CLASS} font-bold text-brand`} />
            </label>

            <label className="text-sm font-bold text-ink">
              Consulta o mensaje
              <textarea
                required
                minLength={5}
                maxLength={2000}
                value={form.message}
                onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                className="mt-1.5 min-h-28 w-full rounded-card border border-edge bg-white p-3 text-sm font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
              />
            </label>

            {error ? <p className="rounded-card bg-error/10 p-3 text-sm font-bold text-error">{error}</p> : null}

            <button
              disabled={submitting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-card bg-brand px-5 text-sm font-black text-on-brand hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Enviando..." : "Enviar consulta"}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
