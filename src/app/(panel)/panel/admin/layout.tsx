import type { ReactNode } from "react";
import { requireRole } from "@/features/auth";
import { getModulesForRole } from "@/shared/config/modules";
import { GenericPanelShell } from "@/app/(panel)/panel/generic-panel-shell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireRole("ADMIN");

  return (
    <GenericPanelShell
      name={session.name}
      role={session.role}
      modules={getModulesForRole(session.role)}
    >
      {children}
    </GenericPanelShell>
  );
}
