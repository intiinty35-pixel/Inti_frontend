import type { ReactNode } from "react";
import { requireRole } from "@/features/auth";
import { ROLE_LABELS } from "@/shared/config/roles";
import { AdminShell } from "@/app/(panel)/panel/admin/admin-shell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireRole("ADMIN");

  return (
    <AdminShell name={session.name} roleLabel={ROLE_LABELS[session.role]}>
      {children}
    </AdminShell>
  );
}
