import Link from "next/link";
import { ArrowRightIcon, Container } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";

interface FooterLink {
  label: string;
  href?: string;
}

interface FooterGroup {
  title: string;
  links: readonly FooterLink[];
}

const GROUPS: readonly FooterGroup[] = [
  {
    title: "Propiedades",
    links: [
      { label: "Comprar", href: `${ROUTES.properties}?operation=buy` },
      { label: "Alquilar", href: `${ROUTES.properties}?operation=rent` },
      { label: "Proyectos" },
      { label: "Ver mapa", href: `${ROUTES.home}#mapa` },
    ],
  },
  {
    title: "Profesionales",
    links: [
      { label: "Publicar propiedad", href: ROUTES.registerProfessional },
      { label: "Para agentes", href: ROUTES.registerProfessional },
      { label: "Para inmobiliarias", href: ROUTES.registerProfessional },
      { label: "Para desarrolladores", href: ROUTES.registerProfessional },
    ],
  },
  {
    title: "Ariz",
    links: [{ label: "Nosotros" }, { label: "Centro de ayuda" }, { label: "Contacto" }],
  },
];

function Brand() {
  return (
    <Link href={ROUTES.home} className="flex items-center gap-2.5" aria-label="Ariz Proyectos">
      <img src="/logo/logo.png" alt="Ariz Proyectos" className="h-9 w-auto" />
    </Link>
  );
}

function ClosingCta() {
  return (
    <section className="bg-brand py-12 text-center text-white sm:py-14">
      <Container size="wide-tight">
        <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">Empieza hoy</p>
        <h2 className="mt-4 text-3xl font-light tracking-tight sm:text-4xl">
          Tu próxima propiedad está más cerca
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-white/80 sm:text-base">
          Explora miles de opciones verificadas o publica tu propiedad con Ariz.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={`${ROUTES.properties}?operation=buy`}
            className="flex h-11 items-center gap-2 rounded-card bg-accent px-6 text-sm font-bold text-on-accent transition-colors hover:bg-accent-hover"
          >
            Buscar propiedades
            <ArrowRightIcon className="size-4" />
          </Link>
          <Link
            href={ROUTES.registerProfessional}
            className="flex h-11 items-center rounded-card border border-white/45 px-6 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            Publicar una propiedad
          </Link>
        </div>
      </Container>
    </section>
  );
}

export function PublicFooter() {
  return (
    <>
      <ClosingCta />

      <footer className="border-t border-edge bg-surface">
        <Container size="wide" className="py-12 sm:py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:gap-8">
            <div>
              <Brand />
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
                Conectamos personas, propiedades y oportunidades con una experiencia más clara y
                confiable.
              </p>
            </div>

            {GROUPS.map((group) => (
              <div key={group.title}>
                <h2 className="text-[11px] font-bold tracking-[0.18em] text-brand uppercase">
                  {group.title}
                </h2>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      {link.href ? (
                        <Link
                          href={link.href}
                          className="text-sm text-muted transition-colors hover:text-brand"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <span
                          title="Disponible próximamente"
                          className="cursor-default text-sm text-muted"
                        >
                          {link.label}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-edge pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Ariz Proyectos</span>
            <span
              title="Disponible próximamente"
              className="cursor-default font-semibold text-brand"
            >
              Términos y privacidad
            </span>
          </div>
        </Container>
      </footer>
    </>
  );
}
