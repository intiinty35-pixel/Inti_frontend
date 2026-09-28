import type { ReactNode } from "react";
import { requireRole } from "@/features/auth";
<<<<<<< HEAD

export default async function OwnerLayout({ children }: { children: ReactNode }) {
  await requireRole("REAL_ESTATE");
  return children;
=======
import { ROLE_LABELS } from "@/shared/config/roles";
import { OwnerShell } from "@/app/(panel)/panel/owner/owner-shell";

export default async function OwnerLayout({ children }: { children: ReactNode }) {
  const session = await requireRole("REAL_ESTATE");

  return (
    <OwnerShell name={session.name} roleLabel={ROLE_LABELS[session.role]}>
      {children}
    </OwnerShell>
  );
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
}
