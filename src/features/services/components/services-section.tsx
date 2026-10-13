import { ArrowRightIcon, CheckIcon, Container } from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import { buildServiceWhatsappUrl } from "@/features/services/config";
import { FinanceCarousel } from "@/features/services/components/finance-carousel";
import { RevealOnScroll } from "@/features/services/components/reveal-on-scroll";
import { ServiceImage } from "@/features/services/components/service-image";

const COMMERCIAL_SERVICES = [
  "Equipo de asesores comerciales",
  "Venta de proyectos inmobiliarios",
  "Venta de terrenos, casas, departamentos y locales",
  "Captacion y seguimiento de prospectos",
  "Estrategia comercial y de precios",
  "Marketing inmobiliario",
  "Negociacion y cierre de operaciones",
] as const;

const LEGAL_ITEMS = [
  "Partida registral",
  "SUNARP",
  "Titulos de propiedad",
  "Cargas y gravamenes",
  "Contratos",
  "Minutas",
  "Escrituras publicas",
  "Parametros urbanisticos",
  "Habilitacion urbana",
  "Licencias",
] as const;

const EVALUATION_AREAS = [
  {
    title: "Valor comercial",
    text: "Cuanto vale actualmente tu propiedad.",
  },
  {
    title: "Potencial inmobiliario",
    text: "Que tipo de proyecto podria desarrollarse.",
  },
  {
    title: "Zonificacion y parametros",
    text: "Que permite desarrollar o construir la normativa aplicable.",
  },
  {
    title: "Situacion registral",
    text: "Si la propiedad esta correctamente inscrita y libre de observaciones relevantes.",
  },
  {
    title: "Rentabilidad",
    text: "Si conviene vender, desarrollar o evaluar una posible asociacion.",
  },
] as const;

const FINANCE_ITEMS = [
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
  "Estructuramos el proyecto",
  "Gestionamos aspectos legales y tecnicos",
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
] as const;

const FINAL_ACTIONS = [
  {
    title: "Tengo un terreno",
    text: "Quiero conocer su valor y potencial.",
    cta: "Evaluar mi terreno",
    service: "evaluacion de terreno",
  },
  {
    title: "Tengo una propiedad",
    text: "Quiero venderla con asesoria profesional.",
    cta: "Quiero vender",
    service: "venta de propiedad",
  },
  {
    title: "Tengo un proyecto inmobiliario",
    text: "Necesito estructurarlo o formar un equipo comercial.",
    cta: "Hablar con un especialista",
    service: "desarrollo y comercializacion de proyecto",
  },
] as const;

function WhatsappCta({
  service,
  children,
  variant = "primary",
}: {
  service: string;
  children: string;
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
      {children}
      <ArrowRightIcon className="size-4" />
    </a>
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
        <p className={cn("text-[11px] font-bold uppercase tracking-[0.18em]", light ? "text-accent" : "text-accent", eyebrowClassName)}>
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

function CheckList({ items, columns = false }: { items: readonly string[]; columns?: boolean }) {
  return (
    <ul className={cn("grid gap-3", columns && "sm:grid-cols-2")}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
            <CheckIcon className="size-3.5" strokeWidth={2.6} />
          </span>
          <span className="text-sm leading-6 text-ink">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function ServicesSection() {
  return (
    <section id="servicios" className="ariz-services bg-canvas">
      <Container id="comercializacion" size="wide-tight" className="py-12 sm:py-16">
        <RevealOnScroll>
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="font-display text-2xl font-black tracking-tight text-accent sm:text-3xl">
                Comercializacion y corretaje
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-brand sm:text-4xl">
                Vendemos tu proyecto o propiedad
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                Ponemos a tu disposicion un equipo comercial especializado para gestionar el proceso
                de venta, desde la captacion de interesados hasta el cierre.
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

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <WhatsappCta service="venta de propiedad">Quiero vender mi propiedad</WhatsappCta>
                <WhatsappCta service="comercializacion de proyecto" variant="secondary">
                  Quiero comercializar mi proyecto
                </WhatsappCta>
              </div>
            </div>
            <div className="relative">
              <ServiceImage
                src="/servicios/servicios.png"
                alt="Equipo comercial inmobiliario de ARIZ"
                className="h-80 rounded-2xl lg:h-[460px]"
              />
              <div className="absolute inset-x-5 bottom-5 rounded-card bg-white/92 p-5 shadow-[var(--shadow-card)] backdrop-blur">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-accent">
                  Fuerza comercial
                </p>
                <p className="mt-2 text-xl font-black text-brand">
                  ARIZ puede asumir la venta y seguimiento comercial de tu proyecto.
                </p>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </Container>

      <section className="bg-surface py-14 sm:py-18">
        <Container id="legal" size="wide-tight">
          <RevealOnScroll>
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div>
                <SectionHeading
                  eyebrow="Asesoria legal inmobiliaria"
                  eyebrowClassName="text-base sm:text-lg"
                  title="Compra, vende o desarrolla con respaldo legal"
                  text="Revisamos la situacion legal del inmueble y la documentacion necesaria para reducir riesgos antes de tomar una decision."
                />
                <blockquote className="mt-8 border-l-4 border-accent bg-canvas px-5 py-4 text-lg font-black leading-7 text-brand">
                  Revisamos la situacion legal del inmueble antes de que tomes una decision.
                </blockquote>
                <div className="mt-7">
                  <WhatsappCta service="revision legal inmobiliaria">Solicitar revision legal</WhatsappCta>
                </div>
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
                    {index < 3 ? (
                      <span className="absolute left-[calc(100%+0.25rem)] top-1/2 hidden h-px w-3 bg-accent lg:block" aria-hidden />
                    ) : null}
                    {index === 3 ? (
                      <span className="absolute -bottom-3 left-1/2 hidden h-3 w-px bg-accent lg:block" aria-hidden />
                    ) : null}
                    {index > 4 && index < 8 ? (
                      <span className="absolute right-[calc(100%+0.25rem)] top-1/2 hidden h-px w-3 bg-accent lg:block" aria-hidden />
                    ) : null}
                    <span className="absolute left-3 top-3 size-2 rounded-full bg-accent shadow-[0_0_0_4px_rgb(245_184_0_/_0.14)]" aria-hidden />
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

      <Container id="evaluacion" size="wide-tight" className="py-16 sm:py-20">
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
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-accent">
                  Analisis integral
                </p>
                <p className="mt-2 text-xl font-black leading-tight text-brand">
                  Valor comercial, potencial constructivo y viabilidad antes de invertir.
                </p>
              </div>
            </div>
            <div className="flex min-h-[460px] flex-col justify-center">
              <p className="font-display text-2xl font-black tracking-tight text-accent sm:text-3xl">
                Evaluacion de terrenos
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-brand sm:text-4xl">
                Tienes un terreno y no sabes cuanto vale o que puedes desarrollar?
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                Analizamos tu propiedad desde una perspectiva comercial, tecnica y legal para ayudarte
                a tomar una mejor decision.
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
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <WhatsappCta service="evaluacion de terreno">
                  Evaluar mi terreno
                </WhatsappCta>
                <WhatsappCta service="potencial inmobiliario de terreno" variant="secondary">
                  Consultar potencial
                </WhatsappCta>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </Container>

      <section className="bg-surface py-14 sm:py-18">
        <Container size="wide-tight">
          <RevealOnScroll>
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
              <div>
                <p className="font-display text-2xl font-black tracking-tight text-accent sm:text-3xl">
                  Contabilidad y finanzas inmobiliarias
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-brand sm:text-5xl">
                  Los numeros tambien forman parte del proyecto
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                  Evaluamos costos, impuestos, rentabilidad y estructura financiera para conocer la
                  viabilidad economica antes de tomar decisiones.
                </p>
              </div>
              <FinanceCarousel items={FINANCE_ITEMS} />
            </div>
          </RevealOnScroll>
        </Container>
      </section>

      <Container id="desarrollo-inmobiliario" size="wide-tight" className="py-16 sm:py-20">
        <RevealOnScroll>
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-display text-3xl font-black tracking-tight text-accent sm:text-4xl">
              Desarrollo inmobiliario
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-brand sm:text-5xl">
              De un terreno a un proyecto inmobiliario
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              Acompanamos un proyecto desde su evaluacion inicial hasta su comercializacion, cierre
              y postventa.
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
                {index < DEVELOPMENT_STEPS.length - 1 ? (
                  <span className="absolute -right-3 top-1/2 hidden h-px w-6 bg-accent lg:block" aria-hidden />
                ) : null}
              </article>
            ))}
          </div>
        </RevealOnScroll>
      </Container>

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
                    <WhatsappCta service={action.service} variant="accent">
                      {action.cta}
                    </WhatsappCta>
                  </div>
                </article>
              ))}
            </div>
          </RevealOnScroll>
        </Container>
      </section>
    </section>
  );
}
