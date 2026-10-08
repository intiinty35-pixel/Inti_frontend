import type { ReactNode } from "react";
import { requireRole } from "@/features/auth";
import { getMyProfile } from "@/features/owner/api/server";
import { canManageProjects } from "@/features/owner/lib/profile-permissions";
import { OwnerShell } from "@/app/(panel)/panel/owner/owner-shell";

const PROFILE_LABELS = {
  INDEPENDENT_AGENT: "Agente independiente",
  REAL_ESTATE_AGENCY: "Inmobiliaria",
  DEVELOPER: "Desarrolladora",
  INDIVIDUAL_OWNER: "Propietario",
} as const;

export default async function OwnerLayout({ children }: { children: ReactNode }) {
  const session = await requireRole("REAL_ESTATE");
  const profile = await getMyProfile().catch(() => null);
  const allowProjects = canManageProjects(profile);
  const displayName =
    profile?.businessName?.trim() ||
    [profile?.user.firstName, profile?.user.lastName].filter(Boolean).join(" ").trim() ||
    session.name;
  const roleLabel = profile?.type ? PROFILE_LABELS[profile.type] : "Cuenta profesional";

  return (
    <OwnerShell
      name={displayName}
      roleLabel={roleLabel}
      avatarUrl={profile?.user.avatarUrl}
      canManageProjects={allowProjects}
    >
      {children}
    </OwnerShell>
  );
}
