"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";

interface NavItem {
  label: string;
  href?: string;
  isActive?: (pathname: string) => boolean;
}

const ITEMS: readonly NavItem[] = [
  {
    label: "Comprar",
    href: ROUTES.search({ operation: "buy", type: "houses" }),
    isActive: (path) =>
      path === "/" ||
      (path.startsWith("/buy") && !path.startsWith("/buy/projects") && !path.startsWith("/buy/land")),
  },
  {
    label: "Alquilar",
    href: ROUTES.search({ operation: "rent", type: "apartments" }),
    isActive: (path) => path.startsWith("/rent"),
  },
  {
    label: "Proyectos",
    href: ROUTES.search({ operation: "buy", type: "projects" }),
    isActive: (path) => path.startsWith("/buy/projects"),
  },
  {
    label: "Terrenos",
    href: ROUTES.search({ operation: "buy", type: "land" }),
    isActive: (path) => path.startsWith("/buy/land"),
  },
  { label: "Propiedades nuevas" },
  { label: "Mapa" },
];

const BASE = "relative flex h-full items-center px-3 text-xs font-bold whitespace-nowrap";

export function PublicNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Principal" className="flex h-full items-stretch">
      {ITEMS.map((item) => {
        if (!item.href) {
          return (
            <span
              key={item.label}
              title="Disponible próximamente"
              className={cn(BASE, "cursor-default text-brand")}
            >
              {item.label}
            </span>
          );
        }

        const active = item.isActive?.(pathname) ?? false;

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
