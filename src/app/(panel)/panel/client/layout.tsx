import type { ReactNode } from "react";
import { requireRole } from "@/features/auth";
import { ROLE_LABELS } from "@/shared/config/roles";
import { CustomerShell } from "@/app/(panel)/panel/client/customer-shell";
import { FavoritesProvider } from "@/features/favorites";
import { getCustomerProfile } from "@/features/customer-account/api/server";

export default async function ClientLayout({ children }: { children: ReactNode }) {
  const session = await requireRole("USER");
  const profile = await getCustomerProfile();

  return (
    <FavoritesProvider isAuthenticated>
      <CustomerShell
        name={profile.firstName || session.name}
        roleLabel={ROLE_LABELS[session.role]}
        avatarUrl={profile.avatarUrl}
      >
        {children}
      </CustomerShell>
    </FavoritesProvider>
  );
}
