"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Crown,
  Heart,
  KeyRound,
  LayoutDashboard,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { ROUTES } from "@/shared/config/routes";

interface CustomerNavItem {
  key: string;
  label: string;
  href: string;
  Icon: LucideIcon;
}

const NAV_ITEMS: readonly CustomerNavItem[] = [
  { key: "account", label: "Mi cuenta", href: ROUTES.panel.client.base, Icon: LayoutDashboard },
  { key: "favorites", label: "Mis favoritos", href: ROUTES.panel.client.favorites, Icon: Heart },
  /* [OCULTO-DEMO C1] Menu: Mis propiedades
  { key: "properties", label: "Mis propiedades", href: ROUTES.panel.client.properties, Icon: Building2 },
  */
  /* [OCULTO-DEMO C2] Menu: Mis alquileres
  { key: "rentals", label: "Mis alquileres", href: ROUTES.panel.client.rentals, Icon: KeyRound },
  */
  /* [OCULTO-DEMO C3] Menu: Membresia
  { key: "membership", label: "Membresía", href: ROUTES.panel.client.membership, Icon: Crown },
  */
  { key: "profile", label: "Mi perfil", href: ROUTES.panel.client.profile, Icon: UserRound },
];

function isActiveCustomerRoute(pathname: string, href: string) {
  if (href === ROUTES.panel.client.base) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CustomerNav({
  collapsed = false,
  mobile = false,
  onNavigate,
}: {
  collapsed?: boolean;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn(mobile ? "flex flex-col gap-1" : "flex flex-col gap-1.5")}>
      {NAV_ITEMS.map((item) => {
        const active = isActiveCustomerRoute(pathname, item.href);
        const Icon = item.Icon;

        return (
          <Link
            key={item.key}
            href={item.href}
            title={collapsed ? item.label : undefined}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex h-11 items-center rounded-xl text-sm font-semibold transition-colors",
              collapsed ? "justify-center px-0" : "gap-3 px-3",
              active
                ? "bg-brand text-on-brand shadow-[var(--shadow-card)]"
                : "text-muted hover:bg-surface-muted hover:text-ink",
            )}
          >
            <Icon className="size-5 shrink-0" strokeWidth={1.9} />
            {!collapsed ? <span className="truncate">{item.label}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
