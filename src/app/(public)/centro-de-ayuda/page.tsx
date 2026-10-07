import Link from "next/link";
import { Mail } from "lucide-react";
import { ArrowRightIcon } from "@/shared/ui";

const SUPPORT_EMAIL = "arizcenter@gmail.com";

const FAQS = [
  {
    question: "Como publico una propiedad?",
    answer:
      "Crea una cuenta profesional, completa tu perfil y registra la propiedad desde tu panel. El equipo puede revisar la informacion antes de mostrarla al publico.",
  },
  {
    question: "Como solicito informacion de una inversion?",
    answer:
      "Ingresa a /inversiones, revisa el tipo de inversion y abre la oportunidad que te interesa. Desde ahi puedes contactar a un asesor por WhatsApp o correo.",
  },
  {
    question: "ARIZ revisa documentos legales?",
    answer:
      "Si. El equipo puede orientar la revision de partidas, titulos, cargas, contratos, minutas y otros documentos relacionados al inmueble.",
  },
  {
    question: "Puedo vender un terreno o proyecto con ARIZ?",
    answer:
      "Si. Puedes solicitar una evaluacion comercial para definir precio, estrategia, material de venta y seguimiento de interesados.",
  },
  {
    question: "Como funciona una cuenta profesional?",
    answer:
      "Una cuenta profesional permite administrar publicaciones, recibir leads y acceder a herramientas segun el plan o permisos asignados.",
  },
];

export default function HelpCenterPage() {
  const mailHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    "Consulta desde Centro de ayuda ARIZ",
  )}&body=${encodeURIComponent("Hola ARIZ, necesito ayuda con:")}`;

  return (
    <main className="bg-canvas">
      <section className="bg-brand px-4 pb-14 pt-28 text-white sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto w-full max-w-[105rem]">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-accent">Centro de ayuda</p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-black leading-tight sm:text-6xl">
            Respuestas rapidas y soporte directo de ARIZ
          </h1>
          <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-white/78">
            Revisa preguntas frecuentes o escribe al centro de ayuda para recibir asistencia.
          </p>
          <a
            href={mailHref}
            className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-card bg-accent px-5 text-sm font-black text-on-accent hover:bg-accent-hover"
          >
            <Mail className="size-4" />
            Escribir a {SUPPORT_EMAIL}
          </a>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto grid w-full max-w-[105rem] gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-card border border-edge bg-surface p-5 shadow-[var(--shadow-card)]">
            <h2 className="font-display text-3xl font-black text-brand">Preguntas frecuentes</h2>
            <div className="mt-5 grid gap-3">
              {FAQS.map((faq) => (
                <details key={faq.question} className="group rounded-card border border-edge bg-white p-4">
                  <summary className="cursor-pointer list-none text-sm font-black text-brand">
                    <span className="inline-flex w-full items-center justify-between gap-4">
                      {faq.question}
                      <span className="text-lg leading-none text-accent group-open:rotate-45">+</span>
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-muted">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>

          <aside className="h-fit rounded-card border border-edge bg-surface p-5 shadow-[var(--shadow-card)]">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-accent">Soporte</p>
            <h2 className="mt-2 text-2xl font-black text-brand">No encontraste respuesta?</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Envianos tu consulta al correo del centro de ayuda. Incluye tu nombre, telefono y el tema para atenderte mejor.
            </p>
            <a
              href={mailHref}
              className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-card bg-brand px-4 text-sm font-black text-on-brand hover:bg-brand-hover"
            >
              <Mail className="size-4" />
              Enviar correo
            </a>
            <Link
              href="/contacto"
              className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-card border border-edge px-4 text-sm font-black text-brand hover:border-brand"
            >
              Ir a contacto
              <ArrowRightIcon className="size-4" />
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
