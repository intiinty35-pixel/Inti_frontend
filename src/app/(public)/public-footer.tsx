import Link from "next/link";
import { BookOpenText } from "lucide-react";
import { Container } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";

interface FooterLink {
  label: string;
  href?: string;
}

interface FooterGroup {
  title: string;
  links: readonly FooterLink[];
}

type SocialNetwork = "Facebook" | "Instagram" | "TikTok" | "LinkedIn";

const SOCIAL_LINKS: readonly { name: SocialNetwork; href?: string }[] = [
  { name: "Facebook", href: "https://web.facebook.com/Arizproyectos?locale=es_LA" },
  { name: "Instagram", href: "https://www.instagram.com/arizproyectos?utm_source=qr&xtok=MWV5Mnd1OG1meWhseg==" },
  { name: "TikTok", href: "https://www.tiktok.com/@ariz.proyectos.pe?_r=1&_t=ZS-9AOSF3g1aIk" },
  { name: "LinkedIn" },
];

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
    links: [
      { label: "Nosotros", href: "/nosotros" },
      { label: "Centro de ayuda", href: "/centro-de-ayuda" },
      { label: "Contacto", href: "/contacto" },
      { label: "Libro de Reclamaciones", href: ROUTES.claims },
    ],
  },
];

function SocialIcon({ name }: { name: SocialNetwork }) {
  const common = {
    "aria-hidden": true as const,
    className: "size-5 fill-current",
    viewBox: "0 0 24 24",
  };

  switch (name) {
    case "Facebook":
      return (
        <svg {...common}>
          <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
        </svg>
      );
    case "Instagram":
      return (
        <svg {...common}>
          <path d="M7.03.084C5.753.144 4.881.348 4.119.647c-.789.308-1.457.72-2.123 1.388-.665.668-1.075 1.337-1.38 2.127-.296.764-.496 1.637-.552 2.914C.007 8.354-.005 8.764.001 12.023c.006 3.259.021 3.667.083 4.947.061 1.277.264 2.149.563 2.911.308.789.72 1.457 1.388 2.123.668.665 1.337 1.074 2.128 1.38.763.295 1.636.496 2.913.552 1.277.056 1.688.069 4.946.063 3.258-.007 3.668-.021 4.948-.082 1.28-.061 2.147-.265 2.91-.563.789-.309 1.457-.72 2.123-1.388.665-.668 1.074-1.338 1.379-2.128.296-.763.497-1.636.552-2.912.056-1.281.069-1.69.063-4.948-.006-3.258-.021-3.667-.082-4.947-.061-1.28-.264-2.149-.563-2.912-.308-.789-.72-1.457-1.388-2.123-.668-.665-1.338-1.074-2.128-1.379C19.074.321 18.202.12 16.924.065 15.647.009 15.236-.005 11.977.001 8.718.008 8.31.022 7.03.084Zm.14 21.693c-1.17-.051-1.805-.245-2.229-.408-.56-.216-.96-.477-1.382-.895-.422-.418-.681-.819-.9-1.378-.164-.424-.362-1.059-.417-2.229-.06-1.265-.072-1.644-.079-4.848-.007-3.204.005-3.583.061-4.848.05-1.169.246-1.805.408-2.228.216-.562.476-.96.895-1.382.419-.422.818-.681 1.378-.9.423-.165 1.058-.362 2.227-.417 1.266-.06 1.645-.072 4.848-.079 3.204-.007 3.584.005 4.85.061 1.169.051 1.805.245 2.228.408.561.216.96.475 1.382.895.422.419.682.818.901 1.379.165.422.361 1.056.417 2.226.06 1.266.074 1.645.08 4.848.005 3.203-.006 3.584-.061 4.848-.051 1.17-.245 1.806-.408 2.23-.216.56-.476.96-.895 1.381-.419.422-.818.681-1.378.9-.423.165-1.058.362-2.226.418-1.266.059-1.645.072-4.85.079-3.204.007-3.582-.006-4.847-.061ZM16.953 5.586a1.44 1.44 0 1 0 1.437-1.442 1.44 1.44 0 0 0-1.437 1.442ZM5.839 12.012c.007 3.403 2.771 6.156 6.173 6.149 3.403-.006 6.157-2.77 6.151-6.173-.007-3.403-2.771-6.157-6.174-6.15-3.403.007-6.157 2.771-6.15 6.174ZM8 12.008a4 4 0 1 1 4.008 3.992A4 4 0 0 1 8 12.008Z" />
        </svg>
      );
    case "TikTok":
      return (
        <svg {...common}>
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07Z" />
        </svg>
      );
    case "LinkedIn":
      return (
        <svg {...common} viewBox="0 0 448 512">
          <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3C448 46.5 433.6 32 416 32ZM135.4 416H69V202.2h66.5V416Zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5ZM384.3 416h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416Z" />
        </svg>
      );
  }
}

function Brand() {
  return (
    <Link href={ROUTES.home} className="flex items-center gap-2.5" aria-label="Ariz Proyectos">
      <img
        src="/logo/logo.png"
        alt="Ariz Proyectos"
        className="h-10 w-auto rounded-sm bg-white p-1 shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.8)]"
      />
    </Link>
  );
}

export function PublicFooter({ publishHref = ROUTES.registerProfessional }: { publishHref?: string }) {
  return (
    <footer className="bg-brand text-white">
      <Container size="wide" className="py-14 sm:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)_auto] lg:gap-8">
          <div className="col-span-2 flex flex-col items-center text-center sm:col-span-1 sm:items-start sm:text-left">
            <Brand />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/75">
              Conectamos personas, propiedades y oportunidades con una experiencia más clara y
              confiable.
            </p>
          </div>

          {GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
                {group.title}
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <Link
                        href={link.label === "Publicar propiedad" ? publishHref : link.href}
                        className="inline-flex items-center gap-2 text-sm text-white/75 transition-colors hover:text-white"
                      >
                        {link.href === ROUTES.claims ? <BookOpenText className="size-4 text-accent" /> : null}
                        {link.label}
                      </Link>
                    ) : (
                      <span
                        title="Disponible próximamente"
                        className="cursor-default text-sm text-white/75"
                      >
                        {link.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="flex flex-col items-start text-left sm:items-end sm:justify-self-end sm:text-right">
            <h2 className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
              Síguenos
            </h2>
            <ul className="mt-4 grid grid-cols-2 justify-items-start gap-3 sm:flex sm:items-center sm:justify-items-end">
              {SOCIAL_LINKS.map(({ name, href }) => (
                <li key={name}>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Ariz en ${name} (se abre en una pestaña nueva)`}
                      className="grid size-10 place-items-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <SocialIcon name={name} />
                    </a>
                  ) : (
                    <span
                      title="LinkedIn: próximamente"
                      role="img"
                      aria-label="LinkedIn: próximamente"
                      className="grid size-10 cursor-default place-items-center rounded-full border border-white/10 text-white/35"
                    >
                      <SocialIcon name={name} />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sección inferior */}
        <div className="mt-10 grid grid-cols-1 items-center gap-6 border-t border-white/20 pt-6 text-xs text-white/70 md:grid-cols-3">
          {/* Izquierda: Copyright y Términos */}
          <div className="order-2 flex flex-col items-center gap-1 text-center md:order-1 md:items-start md:text-left">
            <span>© {new Date().getFullYear()} Ariz Proyectos</span>
            <Link href={ROUTES.terms} className="font-semibold text-accent transition-colors hover:text-white">
              Términos y condiciones
            </Link>
          </div>

          {/* Centro: Imagen del MVCS y Código */}
          <div className="order-1 flex flex-col items-center gap-1 text-center md:order-2">
            <img
              src="/logo/ministerio-vivienda.png"
              alt="Ministerio de Vivienda, Construcción y Saneamiento del Perú"
              className="h-[4.5rem] w-72 max-w-full rounded-sm bg-white object-cover object-center"
            />
            <p className="text-xs font-bold tracking-wide text-white/85">CÓDIGO N° 02407 - PJ - MVCS</p>
          </div>

          {/* Columna derecha vacía para balancear el grid en desktop */}
          <div className="hidden md:order-3 md:block" />
        </div>
      </Container>
    </footer>
  );
}