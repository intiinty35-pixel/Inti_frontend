import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
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
      <aside className="flex w-full flex-col gap-3 border-b border-edge bg-surface p-4 md:fixed md:inset-y-0 md:left-0 md:w-64 md:gap-6 md:border-r md:border-b-0 md:p-6">
        <Link href={ROUTES.home} className="flex items-center gap-2" aria-label="Inti Proyectos">
          <Image
            src="/logo/logo.png"
            alt="Inti Proyectos"
            width={180}
            height={50}
            className="h-9 w-auto"
          />
        </Link>
        <div className="flex flex-col">
          <p className="font-medium text-ink">{name}</p>
          <p className="text-sm text-muted">{ROLE_LABELS[role]}</p>
        </div>
        <PanelNav modules={[...modules]} />
        <div className="self-end md:mt-auto md:self-auto">
          <LogoutButton />
        </div>
      </aside>
      <main className="md:pl-64">
        <Container
          size={role === "USER" ? "full" : "default"}
          className="py-6 md:py-10"
        >
          {children}
        </Container>
      </main>
    </div>
  );
}
