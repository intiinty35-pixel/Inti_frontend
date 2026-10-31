import type { ReactNode } from "react";
import { getHomeRoute, ROUTES } from "@/shared/config/routes";
import { getSession } from "@/features/auth/api/server";
import { getMyProfile } from "@/features/owner/api/server";
import { getCustomerProfile } from "@/features/customer-account/api/server";
import { PublicHeader } from "@/app/(public)/public-header";
import { PublicFooter } from "@/app/(public)/public-footer";
import { FavoritesProvider } from "@/features/favorites";
import { FloatingWhatsapp } from "@/app/(public)/floating-whatsapp";

function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div id="ariz-public-shell" className="flex min-h-screen flex-col">
      {children}
    </div>
  );
}

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  let accountName = session?.name;
  let accountAvatarUrl: string | undefined;

  if (session?.role === "REAL_ESTATE") {
    try {
      const profile = await getMyProfile();
      accountName = profile.businessName?.trim() || session.name;
      accountAvatarUrl = profile.user.avatarUrl ?? undefined;
    } catch {
      accountName = session.name;
    }
  } else if (session?.role === "USER") {
    const profile = await getCustomerProfile();
    accountName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || session.name;
    accountAvatarUrl = profile.avatarUrl ?? undefined;
  }

  const publishHref =
    session?.role === "USER"
      ? ROUTES.panel.client.newProperty
      : session?.role === "REAL_ESTATE"
        ? ROUTES.panel.owner.newListing
        : session?.role === "ADMIN"
          ? ROUTES.panel.admin.base
          : ROUTES.registerProfessional;

  return (
    <PublicShell>
      <PublicHeader
        isLoggedIn={Boolean(session)}
        accountName={accountName}
        accountAvatarUrl={accountAvatarUrl}
        accountRole={session?.role}
        accountHref={session ? getHomeRoute(session.role) : ROUTES.login}
      />

      <FavoritesProvider isAuthenticated={Boolean(session)}>
        <main className="flex flex-1 flex-col">{children}</main>
      </FavoritesProvider>

      <PublicFooter publishHref={publishHref} />

      <FloatingWhatsapp />
    </PublicShell>
  );
}
