"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import { ROUTES } from "@/shared/config/routes";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", href: ROUTES.panel.owner.base },
  { key: "properties", label: "Mis propiedades", href: ROUTES.panel.owner.listings },
  { key: "projects", label: "Mis proyectos", href: ROUTES.panel.owner.projects },
  { key: "new-property", label: "Publicar propiedad", href: ROUTES.panel.owner.newListing },
  { key: "new-project", label: "Publicar proyecto", href: ROUTES.panel.owner.newProject },
  { key: "leads", label: "Leads / Consultas", href: ROUTES.panel.owner.leads },
  { key: "stats", label: "Estadísticas", href: ROUTES.panel.owner.stats },
  { key: "subscription", label: "Suscripción", href: ROUTES.panel.owner.subscription },
  { key: "profile", label: "Mi perfil", href: ROUTES.panel.owner.profile },
  { key: "settings", label: "Configuración", href: ROUTES.panel.owner.settings },
] as const;

export function OwnerNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === ROUTES.panel.owner.base
            ? pathname === item.href
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              "rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
