import { Container } from "@/shared/ui";
import { SERVICES } from "@/features/services/config";
import { RevealOnScroll } from "@/features/services/components/reveal-on-scroll";
import { ServiceBlock } from "@/features/services/components/service-block";
import { TrustCards } from "@/features/services/components/trust-cards";
import { ServicesCta } from "@/features/services/components/services-cta";

/**
 * Seccion "SERVICIOS" de ARIZ Proyectos: corretaje inmobiliario y el grupo de
 * profesionales que respalda a un desarrollador desde la idea hasta la venta.
 *
 * Se monta debajo del header (ver `src/app/(public)/page.tsx`) y queda anclada
 * en `#servicios` para el enlace del menu principal.
 */
export function ServicesSection() {
  return (
    <section id="servicios" className="ariz-services bg-canvas py-14 sm:py-16">
      {/* ---- Encabezado de la seccion ---- */}
      <Container size="wide-tight">
        <RevealOnScroll className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
            Nuestros servicios
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-brand sm:text-4xl">
            Soluciones integrales para tus proyectos inmobiliarios
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
            Combinamos el corretaje profesional con el respaldo de un grupo inmobiliario que
            acompaña al desarrollador desde la idea hasta la venta.
          </p>
        </RevealOnScroll>
      </Container>

      {/* ---- Los 3 servicios, alternando la foto de lado ---- */}
      <div className="mt-6">
        {SERVICES.map((service, index) => (
          <RevealOnScroll key={service.key}>
            <Container size="wide-tight" className="py-10 sm:py-12">
              <ServiceBlock service={service} reversed={index % 2 === 1} />
            </Container>
          </RevealOnScroll>
        ))}
      </div>

      {/* ---- 3 filas de cards de respaldo ---- */}
      <div className="mt-8 border-t border-edge pt-14">
        <Container size="wide-tight">
          <RevealOnScroll>
            <TrustCards />
          </RevealOnScroll>
        </Container>
      </div>

      {/* ---- Cierre de seccion ---- */}
      <ServicesCta />
    </section>
  );
}
