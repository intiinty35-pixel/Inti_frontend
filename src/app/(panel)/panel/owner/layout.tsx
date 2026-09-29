import type { ReactNode } from "react";
import { requireRole } from "@/features/auth";
import { getMyProfile } from "@/features/owner/api/server";
import { canManageProjects } from "@/features/owner/lib/profile-permissions";
import { ROLE_LABELS } from "@/shared/config/roles";
import { OwnerShell } from "@/app/(panel)/panel/owner/owner-shell";

export default async function OwnerLayout({ children }: { children: ReactNode }) {
  const session = await requireRole("REAL_ESTATE");
  const profile = await getMyProfile().catch(() => null);
  const allowProjects = canManageProjects(profile);

  return (
    <OwnerShell
      name={session.name}
      roleLabel={ROLE_LABELS[session.role]}
      canManageProjects={allowProjects}
    >
      {children}
    </OwnerShell>
  );
}
