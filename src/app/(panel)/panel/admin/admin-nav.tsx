"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BadgeDollarSign,
  BookOpen,
  Boxes,
  Building2,
  CalendarClock,
  ChartNoAxesCombined,
  ClipboardCheck,
  Coins,
  Gift,
  HandCoins,
  Landmark,
  LayoutDashboard,
  House,
  MessageSquareText,
  Trophy,
  UserCog,
  UsersRound,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { ROUTES } from "@/shared/config/routes";

type AdminNavGroup = "general" | "operacion" | "recompensas" | "portafolio";

type AdminNavItem = {
  key: string;
  label: string;
  href: string;
  Icon: LucideIcon;
  group: AdminNavGroup;
};

const GROUP_LABELS: Record<AdminNavGroup, string> = {
  general: "General",
  operacion: "Operación",
  recompensas: "Recompensas",
  portafolio: "Portafolio",
};

const NAV_ITEMS: readonly AdminNavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: ROUTES.panel.admin.base,
    Icon: LayoutDashboard,
    group: "general",
  },
  {
    key: "accounts",
    label: "Cuentas",
    href: ROUTES.panel.admin.accounts,
    Icon: UserCog,
    group: "general",
  },
  {
    key: "developers",
    label: "Desarrolladores",
    href: ROUTES.panel.admin.developers,
    Icon: Landmark,
    group: "operacion",
  },
  {
    key: "agencies",
    label: "Revisión de inmobiliarias",
    href: ROUTES.panel.admin.agencies,
    Icon: Building2,
    group: "operacion",
  },
  {
    key: "plans",
    label: "Planes",
    href: ROUTES.panel.admin.plans,
    Icon: BadgeDollarSign,
    group: "operacion",
  },
  {
    key: "subscriptions",
    label: "Solicitudes de pago",
    href: ROUTES.panel.admin.subscriptions,
    Icon: ClipboardCheck,
    group: "operacion",
  },
  {
    key: "reports",
    label: "Reportes",
    href: ROUTES.panel.admin.reports,
    Icon: MessageSquareText,
    group: "operacion",
  },
  {
    key: "claims",
    label: "Recibo de Reclamos",
    href: ROUTES.panel.admin.claims,
    Icon: BookOpen,
    group: "operacion",
  },
  {
    key: "referrals",
    label: "Miembros y puntos",
    href: ROUTES.panel.admin.referrals,
    Icon: Coins,
    group: "recompensas",
  },
  {
    key: "referral-ranking",
    label: "Miembros",
    href: ROUTES.panel.admin.referralRanking,
    Icon: Trophy,
    group: "recompensas",
  },
  {
    key: "referral-records",
    label: "Control de referidos",
    href: ROUTES.panel.admin.referralRecords,
    Icon: UsersRound,
    group: "recompensas",
  },
  {
    key: "campaigns",
    label: "Campañas",
    href: ROUTES.panel.admin.campaigns,
    Icon: CalendarClock,
    group: "recompensas",
  },
  {
    key: "incentives",
    label: "Incentivos",
    href: ROUTES.panel.admin.incentives,
    Icon: Gift,
    group: "recompensas",
  },
  {
    key: "redemptions",
    label: "Canjes",
    href: ROUTES.panel.admin.redemptions,
    Icon: HandCoins,
    group: "recompensas",
  },
  {
    key: "projects",
    label: "Proyectos ARIZ",
    href: ROUTES.panel.admin.projects,
    Icon: Boxes,
    group: "portafolio",
  },
  {
    key: "ariz-properties",
    label: "Publicar propiedades Ariz",
    href: ROUTES.panel.admin.properties,
    Icon: House,
    group: "portafolio",
  },
  {
    key: "investment-opportunities",
    label: "Proyectos de inversión",
    href: ROUTES.panel.admin.investmentOpportunities,
    Icon: ChartNoAxesCombined,
    group: "portafolio",
  },
] as const;

function isActiveAdminRoute(pathname: string, href: string) {
  if (href === ROUTES.panel.admin.base || href === ROUTES.panel.admin.projects) {
    return pathname === href;
  }
  if (href === ROUTES.panel.admin.referrals) {
    return (
      (pathname === href || pathname.startsWith(`${href}/`)) &&
      !pathname.startsWith(ROUTES.panel.admin.referralRanking) &&
      !pathname.startsWith(ROUTES.panel.admin.referralRecords)
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({
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
      {NAV_ITEMS.map((item, index) => {
        const active = isActiveAdminRoute(pathname, item.href);
        const Icon = item.Icon;
        const showGroup = !collapsed && NAV_ITEMS[index - 1]?.group !== item.group;

        return (
          <div key={item.key} className={cn(showGroup && "mt-2 first:mt-0")}>
            {showGroup ? (
              <p className="px-3 pb-1 pt-2 text-[10px] font-black uppercase tracking-[0.16em] text-muted">
                {GROUP_LABELS[item.group]}
              </p>
            ) : null}
            <Link
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
              <Icon className="size-5 shrink-0" aria-hidden="true" strokeWidth={2.1} />
              {!collapsed ? <span className="truncate">{item.label}</span> : null}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
