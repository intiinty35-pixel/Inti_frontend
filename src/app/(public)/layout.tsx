import type { ReactNode } from "react";
import { getHomeRoute, ROUTES } from "@/shared/config/routes";
import { getSession } from "@/features/auth/api/server";
import { getMyProfile } from "@/features/owner/api/server";
import { getCustomerProfile } from "@/features/customer-account/api/server";
import { PublicHeader } from "@/app/(public)/public-header";
import { PublicFooter } from "@/app/(public)/public-footer";
import { FavoritesProvider } from "@/features/favorites";
import { FloatingWhatsapp } from "@/app/(public)/floating-whatsapp";

/**
 * Cabecera, pie y flotantes del sitio.
 *
 * El mapa a pantalla completa (`map-modal.tsx`) marca este bloque como `inert`
 * mientras esta abierto, asi el tabulador y los lectores de pantalla se quedan
 * dentro del mapa aunque visualmente ya lo tape todo.
 */
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
    } catch {
      accountName = session.name;
    }
  } else if (session?.role === "USER") {
    const profile = await getCustomerProfile();
    accountName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || session.name;
    accountAvatarUrl = profile.avatarUrl ?? undefined;
  }

  return (
    <PublicShell>
      {/*
        La cabecera es un componente client: necesita `usePathname` para saber si
        la pagina arranca con hero oscuro (header transparente) y si ya se
        scrolleo (para entonces ganar fondo). Los datos de sesion se resuelven
        aqui y bajan como props.
      */}
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

      <PublicFooter />

      <FloatingWhatsapp />
    </PublicShell>
  );
}
