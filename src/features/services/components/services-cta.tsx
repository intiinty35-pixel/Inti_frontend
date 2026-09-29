import { ArrowRightIcon, Container } from "@/shared/ui";
import { buildServiceWhatsappUrl } from "@/features/services/config";

/**
 * Cierre de la seccion: banda azul marino con acentos amarillos.
 *
 * Lleva margen inferior propio (`mb-16` = 64px) para que la banda no quede
 * pegada al footer cuando la pagina se monta sin un espaciador extra.
 */
export function ServicesCta() {
  return (
    <section
      id="contacto"
      className="relative mb-16 overflow-hidden bg-brand py-14 text-white sm:py-16"
    >
      {/* Detalle amarillo: una barra superior y un halo radial de marca. */}
      <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-accent" />
      <span
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-accent/15 blur-3xl"
      />

      <Container size="wide-tight" className="relative text-center">
        <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
          Estamos para ayudarte
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          ¿Tienes un proyecto inmobiliario? Conversemos
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-white/80 sm:text-base">
          Cuéntanos en qué etapa está tu proyecto y te armamos una propuesta a medida, sin
          compromiso.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={buildServiceWhatsappUrl("asesoría integral")}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 items-center gap-2 rounded-card bg-accent px-6 text-sm font-bold text-on-accent transition-colors hover:bg-accent-hover"
          >
            Cotiza ahora
            <ArrowRightIcon className="size-4" />
          </a>

          <a
            href="#servicios"
            className="flex h-12 items-center gap-2 rounded-card border border-white/25 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            Ver los servicios
          </a>
        </div>
      </Container>
    </section>
  );
}
