"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowRightIcon, ChevronDownIcon } from "@/shared/ui/icons";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";

interface TypeOption {
  label: string;
  type: "houses" | "apartments" | "land" | "commercial";
}

/**
 * Tipos de propiedad. Se exportan porque el menu movil los reutiliza como
 * subenlaces de "Comprar" y "Alquilar", donde no hay mega menu desplegable.
 */
export const NAV_TYPE_OPTIONS: readonly TypeOption[] = [
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

export interface NavItem {
  label: string;
  href?: string;
  operation?: "buy" | "rent";
  isActive?: (pathname: string, operation: string | null, type: string | null) => boolean;
}

/** Se exporta porque el menu movil construye la misma lista en vertical. */
export const NAV_ITEMS: readonly NavItem[] = [
  {
    label: "Inicio",
    href: ROUTES.home,
    isActive: (path) => path === ROUTES.home,
  },
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
  {
    label: "Mapa",
    href: ROUTES.map,
    isActive: (path) => path === ROUTES.map,
  },
];

const BASE =
  "relative flex h-full items-center gap-1 px-3 text-sm font-black whitespace-nowrap drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.35)]";

/**
 * Color del enlace segun el fondo del header.
 *
 * Con header transparente el texto va en blanco y "Inicio" en el amarillo de
 * marca. Con header solido todo el nav va en azul, incluido "Inicio": el
 * amarillo sobre blanco no llega al contraste minimo.
 */
function linkTone(item: NavItem, overlay: boolean): string {
  const accent = overlay && item.label === "Inicio";
  return accent
    ? "text-accent transition-colors hover:text-accent-hover"
    : overlay
      ? "text-white transition-colors hover:text-white/75"
      : "text-brand transition-colors hover:text-brand-hover";
}

function MegaMenu({ operation, label }: { operation: "buy" | "rent"; label: string }) {
  return (
    <div className="invisible fixed top-[60px] left-1/2 z-50 w-[860px] -translate-x-1/2 translate-y-1 rounded-2xl border border-edge bg-surface opacity-0 shadow-[var(--shadow-pop)] transition-[opacity,transform] duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
      <div className="grid grid-cols-4 gap-10 p-8">
        <div>
          <h3 className="text-[11px] font-black tracking-[0.12em] text-brand uppercase">
            Tipo de propiedad
          </h3>
          <ul className="mt-4 grid gap-3">
            {NAV_TYPE_OPTIONS.map((option) => (
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

export interface PublicNavProps {
  /** `true` cuando el header esta transparente sobre un hero oscuro. */
  overlay?: boolean;
}

export function PublicNav({ overlay = false }: PublicNavProps = {}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const operation = searchParams.get("operation");
  const type = searchParams.get("type");

  return (
    <nav aria-label="Principal" className="flex h-full items-stretch">
      {NAV_ITEMS.map((item) => {
        if (!item.href) {
          return (
            <span
              key={item.label}
              title="Disponible próximamente"
              className={cn(BASE, "cursor-default", overlay ? "text-white/70" : "text-muted")}
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
                className={cn(BASE, linkTone(item, overlay))}
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
            className={cn(BASE, linkTone(item, overlay))}
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

export interface PublicMobileNavProps {
  /** Se dispara en cada enlace para que el header cierre el panel. */
  onNavigate?: () => void;
}

/**
 * Version vertical del nav para el menu hamburguesa.
 *
 * El mega menu de escritorio no cabe en movil, asi que "Comprar" y "Alquilar"
 * se resuelven del lado del cliente: el enlace principal mas una rejilla con los
 * tipos de propiedad. El panel siempre va en version solida (no el overlay del
 * header) porque necesita ser legible sobre el hero como sobre cualquier pagina.
 */
export function PublicMobileNav({ onNavigate }: PublicMobileNavProps = {}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const operation = searchParams.get("operation");
  const type = searchParams.get("type");
  const [expandedOperations, setExpandedOperations] = useState<Set<string>>(() => new Set());

  return (
    <ul className="divide-y divide-edge">
      {NAV_ITEMS.map((item) => {
        const active = item.isActive?.(pathname, operation, type) ?? false;

        if (!item.href) {
          return (
            <li key={item.label}>
              <span
                title="Disponible próximamente"
                className="flex items-center justify-between px-4 py-3.5 text-sm font-bold text-muted"
              >
                {item.label}
                <span className="text-[10px] font-black tracking-[0.08em] uppercase opacity-70">
                  Próximo
                </span>
              </span>
            </li>
          );
        }

        if (item.operation) {
          const currentOperation = item.operation;
          const expanded = expandedOperations.has(currentOperation);
          const panelId = `mobile-${currentOperation}-filters`;

          return (
            <li key={item.label}>
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => {
                  setExpandedOperations((current) => {
                    const next = new Set(current);
                    if (expanded) next.delete(currentOperation);
                    else next.add(currentOperation);
                    return next;
                  });
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-bold transition-colors hover:bg-surface-muted",
                  active ? "text-brand" : "text-ink",
                )}
              >
                {item.label}
                <ChevronDownIcon
                  className={cn("size-4 shrink-0 text-muted transition-transform", expanded && "rotate-180")}
                />
              </button>

              {expanded ? (
                <div id={panelId} className="grid grid-cols-2 gap-2 px-4 pb-3.5">
                  {NAV_TYPE_OPTIONS.map((option) => (
                    <Link
                      key={option.type}
                      href={`${ROUTES.properties}?operation=${currentOperation}&type=${option.type}`}
                      onClick={onNavigate}
                      className="rounded-card bg-surface-muted px-3 py-2 text-xs font-semibold text-ink transition-colors hover:bg-surface hover:text-brand"
                    >
                      {option.label}
                    </Link>
                  ))}
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className="col-span-2 rounded-card border border-edge px-3 py-2 text-center text-xs font-bold text-brand transition-colors hover:bg-surface-muted"
                  >
                    Ver todas las propiedades
                  </Link>
                </div>
              ) : null}
            </li>
          );
        }

        return (
          <li key={item.label}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center justify-between gap-3 px-4 py-3.5 text-sm font-bold transition-colors hover:bg-surface-muted",
                active ? "text-brand" : "text-ink",
              )}
            >
              {item.label}
              {active ? (
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-black tracking-[0.08em] text-on-accent uppercase">
                  Actual
                </span>
              ) : (
                <ArrowRightIcon className="size-4 shrink-0 text-muted" />
              )}
            </Link>

          </li>
        );
      })}
    </ul>
  );
}
