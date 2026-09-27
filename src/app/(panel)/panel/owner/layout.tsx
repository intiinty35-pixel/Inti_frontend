import type { ReactNode } from "react";
import { requireRole } from "@/features/auth";
import { ROLE_LABELS } from "@/shared/config/roles";
import { OwnerShell } from "@/app/(panel)/panel/owner/owner-shell";

export default async function OwnerLayout({ children }: { children: ReactNode }) {
  const session = await requireRole("REAL_ESTATE");

  return (
    <OwnerShell name={session.name} roleLabel={ROLE_LABELS[session.role]}>
      {children}
    </OwnerShell>
  );
}
