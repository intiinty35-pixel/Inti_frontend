import type { ReactNode } from "react";
import { SparkleIcon, WhatsappIcon } from "@/shared/ui";
import { buildServiceWhatsappUrl } from "@/features/services";
import { getHomeRoute, ROUTES } from "@/shared/config/routes";
import { getSession } from "@/features/auth/api/server";
import { getMyProfile } from "@/features/owner/api/server";
import { PublicHeader } from "@/app/(public)/public-header";
import { PublicFooter } from "@/app/(public)/public-footer";

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

  if (session?.role === "REAL_ESTATE") {
    try {
      const profile = await getMyProfile();
      accountName = profile.businessName?.trim() || session.name;
    } catch {
      accountName = session.name;
    }
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
        accountHref={session ? getHomeRoute(session.role) : ROUTES.login}
      />

      <main className="flex flex-1 flex-col">{children}</main>

      <PublicFooter />

      <a
        href={buildServiceWhatsappUrl("información general")}
        target="_blank"
        rel="noreferrer"
        aria-label="Escríbenos por WhatsApp"
        title="Escríbenos por WhatsApp"
        className="fixed right-5 bottom-10 z-50 flex size-12 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[var(--shadow-pop)] transition-transform hover:scale-105 hover:bg-[#1fb857]"
      >
        <WhatsappIcon className="size-6" />
      </a>
    </PublicShell>
  );
}
