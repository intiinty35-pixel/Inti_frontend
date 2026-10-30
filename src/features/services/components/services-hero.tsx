import { SERVICES_HERO_IMAGE } from "@/features/services/config";
import { ServiceImage } from "@/features/services/components/service-image";

/**
 * Cabecera visual de `/servicios`.
 * Conserva la imagen hero actual; el contenido comercial empieza debajo.
 */
export function ServicesHero() {
  return (
    <section className="relative -mt-[var(--header-h)] overflow-hidden bg-brand text-white">
      <div className="relative aspect-[12/5] w-full sm:aspect-[8/3]">
        <ServiceImage
          src={SERVICES_HERO_IMAGE}
          alt="Servicios inmobiliarios de INTI Proyectos"
          priority
          unoptimized
          className="size-full"
          imgClassName="object-cover object-center sm:object-contain"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-brand/55 via-brand/20 to-transparent"
        />
      </div>
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-accent" />
    </section>
  );
}
