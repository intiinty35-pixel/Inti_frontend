import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "@/shared/ui";

export const metadata: Metadata = {
  title: "Terminos y condiciones | Ariz Inmobiliaria",
  description:
    "Terminos y condiciones de uso de Ariz Inmobiliaria para propiedades, proyectos, inversiones, referidos y servicios inmobiliarios.",
};

const SECTIONS = [
  {
    title: "1. Aceptacion de los terminos",
    body: [
      "Al navegar, registrarte, enviar formularios, publicar inmuebles, solicitar informacion o usar los servicios de Ariz Inmobiliaria, aceptas estos terminos y condiciones.",
      "Si no estas de acuerdo con alguna condicion, debes abstenerte de usar la plataforma o solicitar servicios mediante sus canales digitales.",
    ],
  },
  {
    title: "2. Servicios de Ariz Inmobiliaria",
    body: [
      "Ariz Inmobiliaria brinda informacion, intermediacion, promocion, asesoria comercial y canales de contacto para compra, venta, alquiler, inversion, corretaje y desarrollo de proyectos inmobiliarios.",
      "La plataforma puede mostrar propiedades, proyectos, oportunidades de inversion, servicios, formularios, mapas, imagenes, precios referenciales y datos enviados por propietarios, asesores, desarrolladores o terceros autorizados.",
    ],
  },
  {
    title: "3. Informacion publicada",
    body: [
      "Ariz procura mantener informacion clara y actualizada, pero los precios, areas, disponibilidad, condiciones comerciales, ubicaciones, imagenes, planos y caracteristicas pueden variar sin previo aviso.",
      "Toda decision de compra, alquiler, inversion o contratacion debe ser confirmada directamente con un asesor de Ariz y, cuando corresponda, con la documentacion legal y tecnica respectiva.",
    ],
  },
  {
    title: "4. Registro, formularios y datos de contacto",
    body: [
      "El usuario declara que la informacion enviada mediante formularios es verdadera, actual, completa y que cuenta con autorizacion para compartirla.",
      "Al enviar tus datos, autorizas a Ariz Inmobiliaria a contactarte por telefono, WhatsApp, correo electronico u otros medios para atender tu solicitud, coordinar visitas, enviar informacion comercial o dar seguimiento a procesos inmobiliarios.",
    ],
  },
  {
    title: "5. Publicacion de propiedades y proyectos",
    body: [
      "Los usuarios que publiquen propiedades o proyectos son responsables de la veracidad de la informacion, titularidad, autorizaciones, imagenes, documentos y condiciones ofrecidas.",
      "Ariz puede revisar, pausar, rechazar, editar o retirar publicaciones cuando detecte informacion incompleta, inconsistente, engañosa, duplicada, no autorizada o contraria a estos terminos.",
    ],
  },
  {
    title: "6. Referidos, puntos e incentivos",
    body: [
      "El programa de referidos permite registrar contactos interesados en servicios o productos inmobiliarios. Los puntos, beneficios o incentivos dependen de las reglas vigentes, validacion del referido y disponibilidad de recompensas.",
      "Ariz puede verificar, aprobar, rechazar o ajustar referidos, puntos y canjes cuando exista informacion incorrecta, duplicidad, uso indebido o incumplimiento de las condiciones del programa.",
    ],
  },
  {
    title: "7. Inversiones inmobiliarias",
    body: [
      "Las oportunidades de inversion publicadas son informativas y pueden estar sujetas a evaluacion, disponibilidad, condiciones comerciales, documentacion, riesgos propios del mercado y cambios del proyecto.",
      "Los rendimientos, plusvalias, retornos o beneficios mencionados son referenciales, no constituyen garantia de resultado y deben ser revisados antes de tomar una decision.",
    ],
  },
  {
    title: "8. Responsabilidad del usuario",
    body: [
      "El usuario se compromete a usar la plataforma de manera licita, respetuosa y sin afectar la seguridad, disponibilidad, reputacion o funcionamiento de Ariz Inmobiliaria.",
      "Esta prohibido enviar informacion falsa, suplantar identidades, publicar contenido sin autorizacion, intentar acceder a cuentas ajenas o usar la plataforma para fines fraudulentos.",
    ],
  },
  {
    title: "9. Limitacion de responsabilidad",
    body: [
      "Ariz Inmobiliaria no sera responsable por decisiones tomadas sin verificar informacion, por cambios realizados por terceros, por fallas de servicios externos o por negociaciones realizadas fuera de los canales formales de atencion.",
      "La participacion de Ariz como plataforma, intermediario o asesor no reemplaza la revision legal, financiera, tecnica o tributaria que cada usuario deba realizar segun su caso.",
    ],
  },
  {
    title: "10. Proteccion de datos",
    body: [
      "Ariz trata los datos personales enviados por los usuarios para atender solicitudes, gestionar contactos, prestar servicios, mejorar la experiencia y realizar comunicaciones relacionadas con sus actividades inmobiliarias.",
      "El usuario puede solicitar actualizacion, rectificacion o eliminacion de sus datos mediante los canales oficiales de contacto de Ariz Inmobiliaria.",
    ],
  },
  {
    title: "11. Cambios en los terminos",
    body: [
      "Ariz Inmobiliaria puede modificar estos terminos y condiciones cuando lo considere necesario. La version vigente sera la publicada en esta pagina.",
      "El uso continuo de la plataforma despues de una actualizacion implica la aceptacion de los cambios realizados.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="bg-canvas">
      <section className="bg-brand px-4 pb-14 pt-28 text-white sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto w-full max-w-[105rem]">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-accent">
            Legal
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-black leading-tight sm:text-6xl">
            Terminos y condiciones de Ariz Inmobiliaria
          </h1>
          <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-white/78">
            Condiciones aplicables al uso del sitio, formularios, publicaciones, servicios,
            inversiones y programa de referidos de Ariz Inmobiliaria.
          </p>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto grid w-full max-w-[105rem] gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <article className="rounded-card border border-edge bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
            <p className="text-sm font-semibold text-muted">
              Ultima actualizacion: octubre de 2026.
            </p>

            <div className="mt-8 grid gap-7">
              {SECTIONS.map((section) => (
                <section key={section.title}>
                  <h2 className="font-display text-2xl font-black text-brand">
                    {section.title}
                  </h2>
                  <div className="mt-3 grid gap-3">
                    {section.body.map((paragraph) => (
                      <p key={paragraph} className="text-sm leading-7 text-muted">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </article>

          <aside className="h-fit rounded-card border border-edge bg-surface p-6 shadow-[var(--shadow-card)] lg:sticky lg:top-24">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">
              Contacto
            </p>
            <h2 className="mt-2 text-xl font-black text-brand">Necesitas ayuda?</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Si tienes dudas sobre estos terminos o sobre el uso de tus datos, contacta al
              equipo de Ariz Inmobiliaria.
            </p>
            <Link
              href="/contacto"
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-card bg-brand px-5 text-sm font-black text-on-brand hover:bg-brand-hover"
            >
              Contactar
              <ArrowRightIcon className="size-4" />
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
