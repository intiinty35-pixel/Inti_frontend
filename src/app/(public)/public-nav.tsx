"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDownIcon } from "@/shared/ui/icons";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";

interface TypeOption {
  label: string;
  type: "houses" | "apartments" | "land" | "commercial";
}

const TYPE_OPTIONS: readonly TypeOption[] = [
  { label: "Casas", type: "houses" },
  { label: "Departamentos", type: "apartments" },
  { label: "Terrenos", type: "land" },
  { label: "Locales comerciales", type: "commercial" },
];

const ROOM_OPTIONS = [1, 2, 3, 4, 5] as const;

interface PriceRange {
  label: string;
  priceMin?: number;
  priceMax?: number;
}

const PRICE_RANGES: Record<"buy" | "rent", readonly PriceRange[]> = {
  buy: [
    { label: "Hasta S/ 200,000", priceMax: 200_000 },
    { label: "S/ 200,000 – 400,000", priceMin: 200_000, priceMax: 400_000 },
    { label: "S/ 400,000 – 600,000", priceMin: 400_000, priceMax: 600_000 },
    { label: "Más de S/ 600,000", priceMin: 600_000 },
  ],
  rent: [
    { label: "Hasta S/ 1,000", priceMax: 1_000 },
    { label: "S/ 1,000 – 2,000", priceMin: 1_000, priceMax: 2_000 },
    { label: "S/ 2,000 – 3,500", priceMin: 2_000, priceMax: 3_500 },
    { label: "Más de S/ 3,500", priceMin: 3_500 },
  ],
};

function priceHref(operation: "buy" | "rent", range: PriceRange): string {
  const params = new URLSearchParams({ operation });
  if (range.priceMin) params.set("priceMin", String(range.priceMin));
  if (range.priceMax) params.set("priceMax", String(range.priceMax));
  return `${ROUTES.properties}?${params.toString()}`;
}

interface NavItem {
  label: string;
  href?: string;
  operation?: "buy" | "rent";
  isActive?: (pathname: string, operation: string | null, type: string | null) => boolean;
}

const ITEMS: readonly NavItem[] = [
  {
    label: "Servicios",
    href: ROUTES.services,
    isActive: (path) => path === ROUTES.services,
  },
  {
    label: "Comprar",
    href: `${ROUTES.properties}?operation=buy`,
    operation: "buy",
    isActive: (path, operation, type) =>
      path === ROUTES.properties && operation !== "rent" && type !== "land",
  },
  {
    label: "Alquilar",
    href: `${ROUTES.properties}?operation=rent`,
    operation: "rent",
    isActive: (path, operation) => path === ROUTES.properties && operation === "rent",
  },
  {
    label: "Proyectos",
    href: ROUTES.projects,
    isActive: (path, _operation, type) =>
      path === ROUTES.projects || (path === ROUTES.properties && type === "projects"),
  },
  {
    label: "Terrenos",
    href: `${ROUTES.properties}?operation=buy&type=land`,
    isActive: (path, _operation, type) => path === ROUTES.properties && type === "land",
  },
  { label: "Mapa" },
];

const BASE = "relative flex h-full items-center gap-1 px-3 text-xs font-bold whitespace-nowrap";

function MegaMenu({ operation, label }: { operation: "buy" | "rent"; label: string }) {
  return (
    <div className="invisible fixed top-[60px] left-1/2 z-50 w-[860px] -translate-x-1/2 translate-y-1 rounded-2xl border border-edge bg-surface opacity-0 shadow-[var(--shadow-pop)] transition-[opacity,transform] duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
      <div className="grid grid-cols-4 gap-10 p-8">
        <div>
          <h3 className="text-[11px] font-black tracking-[0.12em] text-brand uppercase">
            Tipo de propiedad
          </h3>
          <ul className="mt-4 grid gap-3">
            {TYPE_OPTIONS.map((option) => (
              <li key={option.type}>
                <Link
                  href={`${ROUTES.properties}?operation=${operation}&type=${option.type}`}
                  className="text-sm text-ink transition-colors hover:text-brand"
                >
                  {option.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] font-black tracking-[0.12em] text-brand uppercase">
            Dormitorios
          </h3>
          <ul className="mt-4 grid gap-3">
            {ROOM_OPTIONS.map((rooms) => (
              <li key={rooms}>
                <Link
                  href={`${ROUTES.properties}?operation=${operation}&roomsMin=${rooms}`}
                  className="text-sm text-ink transition-colors hover:text-brand"
                >
                  {rooms === 5 ? "5 o más dormitorios" : `${rooms} ${rooms === 1 ? "dormitorio" : "dormitorios"}`}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] font-black tracking-[0.12em] text-brand uppercase">Precio</h3>
          <ul className="mt-4 grid gap-3">
            {PRICE_RANGES[operation].map((range) => (
              <li key={range.label}>
                <Link
                  href={priceHref(operation, range)}
                  className="text-sm text-ink transition-colors hover:text-brand"
                >
                  {range.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] font-black tracking-[0.12em] text-brand uppercase">
            Otras operaciones
          </h3>
          <ul className="mt-4 grid gap-3">
            <li>
              <Link
                href={ROUTES.projects}
                className="text-sm text-ink transition-colors hover:text-brand"
              >
                Proyectos
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <Link
        href={`${ROUTES.properties}?operation=${operation}`}
        className="flex h-11 items-center justify-center border-t border-edge text-xs font-bold text-brand transition-colors hover:bg-surface-muted"
      >
        Ver todas las propiedades en {label.toLowerCase()}
      </Link>
    </div>
  );
}

export function PublicNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const operation = searchParams.get("operation");
  const type = searchParams.get("type");

  return (
    <nav aria-label="Principal" className="flex h-full items-stretch">
      {ITEMS.map((item) => {
        if (!item.href) {
          return (
            <span
              key={item.label}
              title="Disponible próximamente"
              className={cn(BASE, "cursor-default text-muted")}
            >
              {item.label}
            </span>
          );
        }

        const active = item.isActive?.(pathname, operation, type) ?? false;

        if (item.operation) {
          return (
            <div key={item.label} className="group relative h-full">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(BASE, "text-brand transition-colors hover:text-brand-hover")}
              >
                {item.label}
                <ChevronDownIcon className="size-3.5 transition-transform group-hover:-rotate-180" />
                {active ? (
                  <span aria-hidden className="absolute inset-x-3 bottom-0 h-[3px] rounded-t bg-accent" />
                ) : null}
              </Link>
              <MegaMenu operation={item.operation} label={item.label} />
            </div>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(BASE, "text-brand transition-colors hover:text-brand-hover")}
          >
            {item.label}
            {active ? (
              <span aria-hidden className="absolute inset-x-3 bottom-0 h-[3px] rounded-t bg-accent" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
