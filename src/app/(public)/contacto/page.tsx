import Link from "next/link";
import { Building2, Handshake, Lightbulb, Mail, MapPin, Network, Phone, ShieldCheck, Share2, UsersRound } from "lucide-react";
import { ContactForm } from "@/app/(public)/contacto/contact-form";

const VALUE_PROPS = [
  {
    title: "Enfoque integral",
    text: "Integramos servicios inmobiliarios, comerciales y de construccion en una propuesta articulada.",
    Icon: Building2,
  },
  {
    title: "Conocimiento del mercado regional",
    text: "Desarrollamos nuestra actividad desde Santa Cruz de la Sierra, con cercania al entorno local y sus oportunidades.",
    Icon: MapPin,
  },
  {
    title: "Respaldo institucional",
    text: "Identidad empresarial y registro de agencia inmobiliaria ante el Ministerio de Vivienda.",
    Icon: ShieldCheck,
  },
  {
    title: "Acompanamiento personalizado",
    text: "Buscamos relaciones duraderas con clientes, propietarios, promotores e inversionistas.",
    Icon: Handshake,
  },
  {
    title: "Capacidad de articulacion",
    text: "Coordinamos la intervencion de especialistas tecnicos, legales y financieros, segun la operacion.",
    Icon: Network,
  },
  {
    title: "Vision de innovacion",
    text: "Proyectamos nuevos canales digitales, una red de referidos y programas de capacitacion.",
    Icon: Lightbulb,
  },
] as const;

const INFO = [
  {
    label: "Oficina",
    value: "Santa Cruz de la Sierra",
    href: "https://www.google.com/maps/search/Santa%20Cruz%20de%20la%20Sierra%2C%20Bolivia",
    Icon: MapPin,
  },
  {
    label: "WhatsApp / Telefono",
    value: "+591 63204858",
    href: "https://wa.me/59163204858",
    Icon: Phone,
  },
  {
    label: "Correo",
    value: "intiinty35@gmail.com",
    href: "mailto:intiinty35@gmail.com",
    Icon: Mail,
  },
  {
    label: "Facebook",
    value: "Inmobiliaria Inti Proyectos",
    href: "https://web.facebook.com/Arizproyectos?locale=es_LA",
    Icon: Share2,
  },
] as const;

export default function ContactPage() {
  return (
    <main className="bg-canvas">
      <section className="bg-brand px-4 pb-14 pt-28 text-white sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto flex w-full max-w-[105rem] flex-col items-center text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-accent">
            Presentacion corporativa
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-black leading-tight sm:text-6xl">
            Un solo aliado para distintas necesidades del ciclo inmobiliario.
          </h1>
          <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-white/78">
            Ponte en contacto con Inti Proyectos para identificar oportunidades,
            administrar procesos comerciales y materializar proyectos inmobiliarios.
          </p>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto w-full max-w-[105rem]">
          <div className="mb-5 flex flex-col gap-2">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">
              Nuestra propuesta de valor
            </p>
            <h2 className="font-display text-3xl font-black text-brand">
              Por que Inti Proyectos
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {VALUE_PROPS.map(({ title, text, Icon }) => (
              <article key={title} className="rounded-card border border-edge bg-surface p-5 shadow-[var(--shadow-card)]">
                <span className="flex size-11 items-center justify-center rounded-card bg-brand/10 text-brand">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-black text-brand">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto grid w-full max-w-[105rem] gap-6 lg:grid-cols-[minmax(0,1fr)_410px]">
          <ContactForm />

          <aside className="grid h-fit gap-4">
            <div className="rounded-card border border-edge bg-surface p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-card bg-brand/10 text-brand">
                  <UsersRound className="size-5" />
                </span>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-accent">
                    Trabajemos juntos
                  </p>
                  <h2 className="text-2xl font-black text-brand">INTI Proyectos</h2>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-muted">
                Ponemos a disposicion de nuestros clientes y aliados una propuesta empresarial
                orientada a identificar oportunidades, administrar procesos comerciales y
                materializar proyectos inmobiliarios con responsabilidad y compromiso.
              </p>
            </div>

            {INFO.map(({ label, value, href, Icon }) => (
              <Link
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                className="flex gap-3 rounded-card border border-edge bg-surface p-4 shadow-[var(--shadow-card)] transition hover:border-brand hover:bg-brand/5"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-card bg-brand/10 text-brand">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-black uppercase tracking-[0.14em] text-muted">{label}</span>
                  <span className="mt-1 block text-sm font-bold leading-6 text-ink">{value}</span>
                </span>
              </Link>
            ))}

            <p className="rounded-card border border-edge bg-surface-muted p-4 text-xs leading-6 text-muted">
              Documento de presentacion institucional. La disponibilidad de servicios especificos se
              confirma mediante propuesta comercial y contrato correspondiente.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
