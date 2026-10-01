"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileIcon, UserIcon, ChartIcon, PlusIcon } from "@/shared/ui/icons";
import { cn } from "@/shared/lib/cn";
import { ROUTES } from "@/shared/config/routes";

const NAV_ITEMS = [
  { key: "professionals", label: "Profesionales", href: ROUTES.panel.admin.base, Icon: UserIcon },
  { key: "plans", label: "Planes", href: ROUTES.panel.admin.plans, Icon: ChartIcon },
  { key: "subscriptions", label: "Solicitudes de pago", href: ROUTES.panel.admin.subscriptions, Icon: FileIcon },
  { key: "projects", label: "Proyectos ARIZ", href: ROUTES.panel.admin.projects, Icon: ChartIcon },
  { key: "new-project", label: "Crear proyecto", href: ROUTES.panel.admin.newProject, Icon: PlusIcon },
] as const;

function isActiveAdminRoute(pathname: string, href: string) {
  if (href === ROUTES.panel.admin.base || href === ROUTES.panel.admin.projects) return pathname === href;
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
      {NAV_ITEMS.map((item) => {
        const active = isActiveAdminRoute(pathname, item.href);
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
