import { Container } from "@/shared/ui";
import { SERVICES_HERO_IMAGE } from "@/features/services/config";
import { ServiceImage } from "@/features/services/components/service-image";

/**
 * Cabecera de la pagina `/servicios`: imagen completa, degradado sutil para
 * destacar la cabecera y el texto debajo de la imagen.
 *
 * Igual que el hero del home, sube por debajo del header transparente con
 * margen negativo.
 */
export function ServicesHero() {
  return (
    <section className="relative -mt-[var(--header-h)] overflow-hidden bg-brand text-white">
      <div className="relative aspect-[8/3] w-full">
        <ServiceImage
          src={SERVICES_HERO_IMAGE}
          alt="Servicios inmobiliarios de ARIZ Proyectos"
          priority
          unoptimized
          className="size-full"
          imgClassName="object-contain object-center"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-brand/55 via-brand/20 to-transparent"
        />
      </div>
      <Container size="wide-tight" className="py-7 sm:py-8">
        <p className="text-[11px] font-black tracking-[0.18em] text-accent uppercase">
          ARIZ Proyectos
        </p>
        <h1 className="mt-2 text-2xl leading-tight font-black tracking-tight text-white sm:text-3xl">
          Servicios para hacer crecer tu proyecto
        </h1>
        <p className="mt-3 text-sm leading-relaxed font-medium text-white/90 sm:text-base">
          Un equipo de profesionales te acompaña desde la planificación hasta alcanzar tus
          objetivos.
        </p>
      </Container>
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-accent" />
    </section>
  );
}
