"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellIcon,
  ChartIcon,
  HomeIcon,
  MapIcon,
  PlusIcon,
  SettingsIcon,
  UserIcon,
} from "@/shared/ui/icons";
import { cn } from "@/shared/lib/cn";
import { ROUTES } from "@/shared/config/routes";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", href: ROUTES.panel.owner.base, Icon: HomeIcon },
  { key: "properties", label: "Mis propiedades", href: ROUTES.panel.owner.listings, Icon: MapIcon },
  { key: "projects", label: "Mis proyectos", href: ROUTES.panel.owner.projects, Icon: ChartIcon },
  { key: "new-property", label: "Publicar propiedad", href: ROUTES.panel.owner.newListing, Icon: PlusIcon },
  { key: "new-project", label: "Publicar proyecto", href: ROUTES.panel.owner.newProject, Icon: PlusIcon },
  /* [OCULTO-DEMO O1] Menu: Estadisticas
  { key: "stats", label: "Estadisticas", href: ROUTES.panel.owner.stats, Icon: ChartIcon },
  */
  /* [OCULTO-DEMO O2] Menu: Suscripcion
  { key: "subscription", label: "Suscripcion", href: ROUTES.panel.owner.subscription, Icon: BellIcon },
  */
  { key: "profile", label: "Mi perfil", href: ROUTES.panel.owner.profile, Icon: UserIcon },
  /* [OCULTO-DEMO O3] Menu: Configuracion
  { key: "settings", label: "Configuracion", href: ROUTES.panel.owner.settings, Icon: SettingsIcon },
  */
] as const;

function isActiveOwnerRoute(pathname: string, href: string) {
  if (href === ROUTES.panel.owner.base) return pathname === href;
  if (href === ROUTES.panel.owner.listings) {
    return pathname === href || (pathname.startsWith(`${href}/`) && pathname !== ROUTES.panel.owner.newListing);
  }
  if (href === ROUTES.panel.owner.projects) {
    return pathname === href || (pathname.startsWith(`${href}/`) && pathname !== ROUTES.panel.owner.newProject);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function OwnerNav({
  collapsed = false,
  mobile = false,
  canManageProjects = true,
  onNavigate,
}: {
  collapsed?: boolean;
  mobile?: boolean;
  canManageProjects?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn(mobile ? "flex flex-col gap-1" : "flex flex-col gap-1.5")}>
      {NAV_ITEMS.filter((item) => {
        if (canManageProjects) return true;
        return item.key !== "projects" && item.key !== "new-project";
      }).map((item) => {
        const active = isActiveOwnerRoute(pathname, item.href);
        const Icon = item.Icon;

        return (
          <Link
            key={item.key}
            href={item.href}
            title={collapsed ? item.label : undefined}
            onClick={onNavigate}
            className={cn(
              "flex h-11 items-center rounded-xl text-sm font-semibold transition-colors",
              collapsed ? "justify-center px-0" : "gap-3 px-3",
              active
                ? "bg-brand text-on-brand shadow-[var(--shadow-card)]"
                : "text-muted hover:bg-surface-muted hover:text-ink",
            )}
          >
            <Icon className="size-5 shrink-0" />
            {!collapsed ? <span className="truncate">{item.label}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
