import Link from "next/link";
import { ArrowRightIcon, CheckCircleIcon, PinIcon } from "@/shared/ui";

const VALUES = [
  "Acompañamiento claro antes de decidir.",
  "Información comercial, legal y técnica en un solo proceso.",
  "Relación de confianza entre propietarios, clientes e inversionistas.",
  "Oportunidades inmobiliarias revisadas con criterio.",
];

export default function AboutPage() {
  return (
    <main className="bg-canvas">
      <section className="bg-brand px-4 pb-14 pt-28 text-white sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto w-full max-w-[105rem]">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-accent">Nosotros</p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-black leading-tight sm:text-6xl">
            ARIZ conecta personas con decisiones inmobiliarias mejor acompañadas
          </h1>
          <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-white/78">
            Somos una plataforma y equipo inmobiliario que acompaña procesos de compra,
            venta, alquiler, inversión y desarrollo de proyectos con información clara.
          </p>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto grid w-full max-w-[105rem] gap-6 lg:grid-cols-[1fr_0.85fr]">
          <article className="rounded-card border border-edge bg-surface p-6 shadow-[var(--shadow-card)]">
            <h2 className="font-display text-3xl font-black text-brand">Quiénes somos</h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              ARIZ Inmobiliaria integra experiencia comercial, gestión documental y tecnología
              para que cada cliente tenga una ruta más ordenada al evaluar una propiedad,
              publicar un inmueble o invertir en una oportunidad.
            </p>
            <p className="mt-4 text-sm leading-7 text-muted">
              Trabajamos con propietarios, agentes, inmobiliarias, desarrolladores e
              inversionistas que buscan procesos serios y comunicación directa.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/contacto"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-card bg-brand px-5 text-sm font-black text-on-brand hover:bg-brand-hover"
              >
                Contactar a ARIZ
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

          <aside className="rounded-card border border-edge bg-surface p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-card bg-brand/10 text-brand">
                <PinIcon className="size-5" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">ARIZ</p>
                <h2 className="text-xl font-black text-brand">Lo que cuidamos</h2>
              </div>
            </div>
            <ul className="mt-5 grid gap-3">
              {VALUES.map((value) => (
                <li key={value} className="flex gap-3 rounded-card bg-canvas p-3 text-sm font-semibold text-ink">
                  <CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-accent" />
                  {value}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
