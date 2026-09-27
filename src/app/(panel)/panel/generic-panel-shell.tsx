import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/shared/ui";
import { LogoutButton } from "@/features/auth";
import { ROLE_LABELS, type UserRole } from "@/shared/config/roles";
import { ROUTES } from "@/shared/config/routes";
import type { ModuleConfig } from "@/shared/config/modules";
import { PanelNav } from "@/app/(panel)/panel/panel-nav";

export interface GenericPanelShellProps {
  name: string;
  role: UserRole;
  modules: readonly ModuleConfig[];
  children: ReactNode;
}

export function GenericPanelShell({ name, role, modules, children }: GenericPanelShellProps) {
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 flex w-64 flex-col gap-6 border-r border-edge bg-surface p-6">
        <Link href={ROUTES.home} className="flex items-center gap-2" aria-label="Ariz Proyectos">
          <span className="text-2xl leading-none font-black text-accent">A</span>
          <span className="text-lg font-extrabold tracking-wide text-brand">ARIZ</span>
        </Link>
        <div className="flex flex-col">
          <p className="font-medium text-ink">{name}</p>
          <p className="text-sm text-muted">{ROLE_LABELS[role]}</p>
        </div>
        <PanelNav modules={[...modules]} />
        <div className="mt-auto">
          <LogoutButton />
        </div>
      </aside>
      <main className="pl-64">
        <Container className="py-10">{children}</Container>
      </main>
    </div>
  );
}
