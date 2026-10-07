import Link from "next/link";
import { Building2, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/app/(public)/contacto/contact-form";

const INFO = [
  {
    label: "Correo",
    value: "arizcenter@gmail.com",
    href: "mailto:arizcenter@gmail.com",
    Icon: Mail,
  },
  {
    label: "Direccion",
    value: "Tumbes, Peru",
    href: "https://www.google.com/maps/search/Tumbes%2C%20Peru",
    Icon: MapPin,
  },
  {
    label: "Industria",
    value: "Inmobiliaria, inversiones y desarrollo de proyectos",
    href: "/servicios",
    Icon: Building2,
  },
  {
    label: "Atencion",
    value: "Consultas comerciales y soporte de plataforma",
    href: "/centro-de-ayuda",
    Icon: Phone,
  },
];

export default function ContactPage() {
  return (
    <main className="bg-canvas">
      <section className="bg-brand px-4 pb-14 pt-28 text-white sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto w-full max-w-[105rem]">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-accent">Contacto</p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-black leading-tight sm:text-6xl">
            Hablemos sobre tu propiedad, proyecto o inversion
          </h1>
          <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-white/78">
            Dejanos tus datos y el equipo de ARIZ te orientara con la informacion que necesitas.
          </p>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto grid w-full max-w-[105rem] gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
          <ContactForm />

          <aside className="grid h-fit gap-4">
            <div className="rounded-card border border-edge bg-surface p-5 shadow-[var(--shadow-card)]">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-accent">ARIZ</p>
              <h2 className="mt-2 text-2xl font-black text-brand">Informacion de contacto</h2>
              <p className="mt-3 text-sm leading-7 text-muted">
                Atendemos consultas sobre compra, venta, alquiler, inversiones, publicaciones
                profesionales y servicios inmobiliarios.
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
          </aside>
        </div>
      </section>
    </main>
  );
}
