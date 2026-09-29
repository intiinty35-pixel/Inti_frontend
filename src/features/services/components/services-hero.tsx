import Link from "next/link";
import { Container } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";

/**
 * Cabecera de la pagina `/servicios`: como la seccion ya no vive debajo del hero
 * del home, necesita su propio encabezado con migas de pan y un CTA de regreso.
 */
export function ServicesHero() {
  return (
    <section className="relative overflow-hidden bg-brand py-12 text-white sm:py-16">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-28 -left-20 size-72 rounded-full bg-accent/20 blur-3xl"
      />
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-accent" />

      <Container size="wide-tight" className="relative">
        <nav aria-label="Ruta de navegación" className="text-xs font-semibold text-white/60">
          <Link href={ROUTES.home} className="transition-colors hover:text-accent">
            Inicio
          </Link>
          <span aria-hidden className="mx-2">
            /
          </span>
          <span className="text-accent">Servicios</span>
        </nav>

        <p className="mt-6 text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
          ARIZ Proyectos
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Servicios para tu proyecto inmobiliario
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
          Corretaje inmobiliario más el respaldo de un grupo de profesionales que acompaña al
          desarrollador desde la idea hasta la venta.
        </p>
      </Container>
    </section>
  );
}
