import { Container } from "@/shared/ui";
import { SERVICES_HERO_IMAGE } from "@/features/services/config";
import { ServiceImage } from "@/features/services/components/service-image";

/**
 * Overlay de la cinta: azul marino al 92% a la izquierda (donde vive el texto)
 * que se abre hasta ~60% a la derecha para dejar respirar la foto. El degradado
 * va horizontal para que el titular siga siendo legible sobre cualquier imagen.
 */
const HERO_OVERLAY =
  "linear-gradient(90deg, rgb(11 27 92 / 0.92) 0%, rgb(11 27 92 / 0.78) 45%, rgb(11 27 92 / 0.60) 100%)";

/**
 * Cabecera de la pagina `/servicios`: cinta con foto de fondo de un proyecto
 * inmobiliario, overlay azul marino y la linea amarilla de marca al pie.
 * Sin migas de pan: el titulo y el subtitulo son el unico contenido.
 */
export function ServicesHero() {
  return (
    <section className="relative isolate overflow-hidden bg-brand min-h-[320px] text-white sm:min-h-[380px] lg:min-h-[420px] lg:max-h-[440px]">
      {/* Fondo: la foto cubre toda la cinta y el degradado garantiza contraste. */}
      <ServiceImage
        src={SERVICES_HERO_IMAGE}
        alt="Proyecto moderno con luz cálida al atardecer"
        priority
        className="absolute inset-0 -z-10 size-full"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ backgroundImage: HERO_OVERLAY }}
      />
      {/* Linea amarilla inferior de marca. */}
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-accent" />

      <Container
        size="wide-tight"
        className="relative flex min-h-[320px] flex-col justify-center py-16 sm:min-h-[380px] sm:py-20 lg:min-h-[420px] lg:py-24"
      >
        <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
          ARIZ Proyectos
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Servicios para hacer crecer tu proyecto
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
          Un equipo de profesionales te acompaña desde la planificación hasta alcanzar tus
          objetivos.
        </p>
      </Container>
    </section>
  );
}
