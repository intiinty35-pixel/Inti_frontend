import type { ReactNode } from "react";
import { requireRole } from "@/features/auth";
import { getModulesForRole } from "@/shared/config/modules";
import { GenericPanelShell } from "@/app/(panel)/panel/generic-panel-shell";

export default async function ClientLayout({ children }: { children: ReactNode }) {
  const session = await requireRole("USER");

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
