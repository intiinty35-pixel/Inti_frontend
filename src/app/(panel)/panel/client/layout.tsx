import type { ReactNode } from "react";
import { requireRole } from "@/features/auth";
<<<<<<< HEAD

export default async function ClientLayout({ children }: { children: ReactNode }) {
  await requireRole("USER");
  return children;
=======
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
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
}
