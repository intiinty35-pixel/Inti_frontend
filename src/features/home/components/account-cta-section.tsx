import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { ArrowRightIcon, BellIcon, ChatIcon, Container, HeartIcon, HomeIcon, PinIcon, SearchIcon, SlidersIcon, SoonButton } from "@/shared/ui";
import { formatArea, formatBathrooms, formatPrice, formatRooms } from "@/shared/lib/format";
import { ROUTES } from "@/shared/config/routes";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

interface Feature {
  key: string;
  title: string;
  description: string;
  icon: IconType;
}

const FEATURES: readonly Feature[] = [
  {
    key: "precisas",
    title: "Búsquedas más precisas",
    description: "Aplica filtros y encuentra propiedades que realmente encajan contigo.",
    icon: SlidersIcon,
  },
  {
    key: "favoritos",
    title: "Favoritos organizados",
    description: "Guarda inmuebles y vuelve a consultarlos cuando quieras.",
    icon: HeartIcon,
  },
  {
    key: "alertas",
    title: "Alertas personalizadas",
    description: "Conoce nuevas oportunidades según ubicación, tipo y presupuesto.",
    icon: BellIcon,
  },
  {
    key: "contacto",
    title: "Contacto directo",
    description: "Consulta propiedades y proyectos desde tu cuenta.",
    icon: ChatIcon,
  },
];

interface Tab {
  key: string;
  label: string;
  icon: IconType;
}

const TABS: readonly Tab[] = [
  { key: "inicio", label: "Inicio", icon: HomeIcon },
  { key: "buscar", label: "Buscar", icon: SearchIcon },
  { key: "favoritos", label: "Favoritos", icon: HeartIcon },
];

const ACTIVE_TAB = "buscar";

/** Fondo decorativo de la columna derecha: la imagen se funde con el color de la sección. */
const BACKDROP = [
  "linear-gradient(90deg, var(--brand-soft) 0%, rgb(232 236 248 / 0.45) 40%, rgb(232 236 248 / 0.12) 100%)",
  "url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80)",
  "linear-gradient(135deg, #2a3b85 0%, #00124f 100%)",
].join(", ");

interface SavedProperty {
  id: string;
  title: string;
  price: number;
  areaM2: number;
  rooms: number;
  bathrooms: number;
}

const SAVED: readonly SavedProperty[] = [
  { id: "miraflores", title: "Departamento en Miraflores", price: 650000, areaM2: 112, rooms: 3, bathrooms: 3 },
  { id: "surco", title: "Departamento en Surco", price: 420000, areaM2: 90, rooms: 3, bathrooms: 2 },
];

function specs(property: SavedProperty): string {
  return [formatArea(property.areaM2), formatRooms(property.rooms), formatBathrooms(property.bathrooms)].join(" · ");
}

/** Vista de la app: muestra el resultado de tener la búsqueda centralizada en la cuenta. */
function AccountPreview() {
  return (
    <div className="rounded-card border border-edge bg-surface p-5 shadow-[var(--shadow-pop)]">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-brand text-base leading-none font-black text-accent">
            A
          </span>
          <span className="text-base font-extrabold tracking-wide text-brand">ARIZ</span>
        </span>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-muted">
          <PinIcon className="size-3.5" />
          Miraflores, Lima
        </span>
      </div>

      <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
        {SAVED.map((property) => (
          <li key={property.id} className="rounded-card border border-edge bg-surface-muted p-3">
            <p className="text-base font-bold text-brand">{formatPrice(property.price)}</p>
            <p className="mt-1 text-[13px] font-semibold text-ink">{property.title}</p>
            <p className="mt-1 text-[11px] text-muted">{specs(property)}</p>
          </li>
        ))}
      </ul>

      <nav aria-label="Navegación de la app" className="mt-5 flex items-stretch border-t border-edge pt-3">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = tab.key === ACTIVE_TAB;

          return (
            <span
              key={tab.key}
              className={`flex flex-1 flex-col items-center gap-1 text-[10px] font-bold ${active ? "text-brand" : "text-muted"}`}
            >
              <Icon className="size-[18px]" />
              {tab.label}
            </span>
          );
        })}
      </nav>
    </div>
  );
}

export function AccountCtaSection() {
  return (
    <section className="relative overflow-hidden bg-brand-soft py-12 sm:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-cover bg-center opacity-80 lg:block"
        style={{ backgroundImage: BACKDROP }}
      />

      <Container size="wide-tight" className="relative grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
            Tu búsqueda, siempre contigo
          </p>
          <h2 className="mt-4 text-3xl font-light tracking-tight text-brand sm:text-4xl">
            Encuentra tu próximo espacio sin perder ninguna oportunidad
          </h2>
          <p className="mt-4 max-w-lg text-sm text-muted sm:text-base">
            Crea una cuenta gratuita y organiza toda tu búsqueda inmobiliaria desde un solo lugar.
          </p>

          <ul className="mt-8 grid gap-x-6 gap-y-7 sm:grid-cols-2">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;

              return (
                <li key={feature.key} className="flex gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-card bg-surface text-brand shadow-[var(--shadow-card)]">
                    <Icon className="size-[18px]" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-brand">{feature.title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted">{feature.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href={ROUTES.registerCustomer}
              className="flex h-11 items-center gap-2 rounded-card bg-brand px-6 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
            >
              Crear cuenta gratuita
              <ArrowRightIcon className="size-4" />
            </Link>
            <SoonButton size="sm" className="h-11 px-6 text-sm">
              Crear una alerta
            </SoonButton>
          </div>
        </div>

        <AccountPreview />
      </Container>
    </section>
  );
}
