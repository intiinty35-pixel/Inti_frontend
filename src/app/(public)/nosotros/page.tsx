import Link from "next/link";
import { Building2, CheckCircle, FileText, Handshake, ShieldCheck, Target, TrendingUp } from "lucide-react";
import { ArrowRightIcon } from "@/shared/ui";

const IDENTITY = [
  {
    title: "Mision",
    icon: Target,
    text: "Conectar a las personas con oportunidades inmobiliarias y desarrollar soluciones de vivienda, inversion y construccion mediante un servicio responsable, cercano y transparente.",
  },
  {
    title: "Vision",
    icon: TrendingUp,
    text: "Consolidarnos como una empresa inmobiliaria y constructora referente en Bolivia, con capacidad de expansion y una oferta integral de servicios.",
  },
  {
    title: "Compromiso",
    icon: ShieldCheck,
    text: "Priorizar la seguridad de las operaciones, la calidad del servicio, el cumplimiento de acuerdos y la mejora continua de nuestros procesos.",
  },
] as const;

const PRINCIPLES = [
  "Transparencia",
  "Responsabilidad",
  "Orientacion al cliente",
  "Trabajo en equipo",
  "Innovacion",
  "Desarrollo sostenible",
] as const;

const INSTITUTIONAL_INFO = [
  { label: "Razon social", value: "Inti Group S.A.C." },
  { label: "Nombre comercial", value: "Inti Proyectos" },
  { label: "RUC", value: "20609623552" },
  { label: "Registro inmobiliario", value: "Codigo de agencia inmobiliaria N.º 02407-PJ-MVCS" },
] as const;

export default function AboutPage() {
  return (
    <main className="bg-canvas">
      <section className="bg-brand px-4 pb-14 pt-28 text-white sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto flex w-full max-w-[105rem] flex-col items-center text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-accent">
            Perfil corporativo
          </p>
          <h1 className="mt-4 max-w-5xl font-display text-4xl font-black leading-tight sm:text-6xl">
            Construimos relaciones de confianza alrededor de cada propiedad, proyecto e inversion.
          </h1>
          <p className="mt-5 max-w-3xl text-base font-semibold leading-7 text-white/78">
            Inti Proyectos articula intermediacion inmobiliaria, promocion de proyectos y
            soluciones vinculadas a construccion y desarrollo urbano.
          </p>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto grid w-full max-w-[105rem] gap-6 lg:grid-cols-[1fr_0.82fr]">
          <article className="rounded-card border border-edge bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-card bg-brand/10 text-brand">
                <Building2 className="size-5" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">
                  Quienes somos
                </p>
                <h2 className="font-display text-3xl font-black text-brand">Inti Proyectos</h2>
              </div>
            </div>

            <p className="mt-6 text-sm leading-7 text-muted">
              Inti Proyectos es el nombre comercial de Inti Group S.A.C., con operaciones en Santa Cruz de la Sierra, Bolivia
              dedicada al sector inmobiliario y de la construccion. Articulamos la
              intermediacion de inmuebles, la promocion y comercializacion de proyectos, y
              soluciones relacionadas con la ejecucion de obras y el desarrollo urbano.
            </p>
            <p className="mt-4 text-sm leading-7 text-muted">
              Nuestra propuesta busca acompañar a clientes, propietarios e inversionistas
              durante las distintas etapas de una operacion inmobiliaria, con informacion clara,
              atencion personalizada y coordinacion con profesionales especializados cuando el
              servicio lo requiera.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/contacto"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-card bg-brand px-5 text-sm font-black text-on-brand hover:bg-brand-hover"
              >
                Contactar a INTI
                <ArrowRightIcon className="size-4" />
              </Link>
              <Link
                href="/servicios"
                className="inline-flex h-11 items-center justify-center rounded-card border border-edge px-5 text-sm font-black text-brand hover:border-brand"
              >
                Ver servicios
              </Link>
            </div>
          </article>

          <aside className="rounded-card border border-edge bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-card bg-brand/10 text-brand">
                <FileText className="size-5" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">
                  Informacion institucional
                </p>
                <h2 className="text-xl font-black text-brand">Datos de la empresa</h2>
              </div>
            </div>

            <dl className="mt-6 grid gap-3">
              {INSTITUTIONAL_INFO.map((item) => (
                <div key={item.label} className="rounded-card border border-edge bg-canvas p-4">
                  <dt className="text-[11px] font-black uppercase tracking-[0.14em] text-muted">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-sm font-black text-ink">{item.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto w-full max-w-[105rem]">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">
              Nuestra identidad institucional
            </p>
            <h2 className="mt-1 font-display text-3xl font-black text-brand">
              Mision, vision y compromiso
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {IDENTITY.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-card border border-edge bg-surface p-6 shadow-[var(--shadow-card)]"
                >
                  <span className="flex size-11 items-center justify-center rounded-card bg-brand/10 text-brand">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-5 font-display text-2xl font-black text-brand">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-14 sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto w-full max-w-[105rem] rounded-card border border-edge bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-card bg-brand/10 text-brand">
                <Handshake className="size-5" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">
                  Principios
                </p>
                <h2 className="font-display text-3xl font-black text-brand">
                  Lo que orienta nuestro trabajo
                </h2>
              </div>
            </div>
          </div>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:mt-0 lg:min-w-[34rem]">
            {PRINCIPLES.map((principle) => (
              <li key={principle} className="flex gap-3 rounded-card bg-canvas p-3 text-sm font-semibold text-ink">
                <CheckCircle className="mt-0.5 size-5 shrink-0 text-accent" />
                {principle}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
