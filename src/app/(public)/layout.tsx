import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/shared/ui/container";
import { SparkleIcon } from "@/shared/ui";
import { getHomeRoute, ROUTES } from "@/shared/config/routes";
import { getSession } from "@/features/auth/api/server";
import { getMyProfile } from "@/features/owner/api/server";
import { PublicNav } from "@/app/(public)/public-nav";
import { PublicFooter } from "@/app/(public)/public-footer";

function Logo() {
  return (
    <Link href={ROUTES.home} className="flex items-center gap-2.5" aria-label="Ariz Proyectos">
      <img src="/logo/logo.png" alt="Ariz Proyectos" className="h-9 w-auto" />
    </Link>
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
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-edge bg-surface">
        <Container size="wide" className="flex flex-wrap items-center justify-between gap-x-6 lg:h-[60px] lg:flex-nowrap">
          <div className="flex h-[60px] items-center">
            <Logo />
          </div>

          <div className="order-last -mx-4 h-11 w-[calc(100%+2rem)] overflow-x-auto px-4 lg:order-none lg:mx-0 lg:h-full lg:w-auto lg:overflow-visible lg:px-0">
            <PublicNav />
          </div>

          {session ? (
            <Link
              href={getHomeRoute(session.role)}
              title={accountName}
              className="inline-flex h-10 max-w-52 items-center truncate rounded-card border border-edge bg-surface px-4 text-xs font-bold text-brand transition-colors hover:border-brand"
            >
              {accountName}
            </Link>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={ROUTES.login}
                className="flex h-10 items-center justify-center rounded-card border border-edge bg-surface px-4 text-xs font-bold whitespace-nowrap text-brand transition-colors hover:border-brand"
              >
                Iniciar sesión
              </Link>
              <Link
                href={ROUTES.register}
                className="flex h-10 items-center justify-center rounded-card bg-brand px-4 text-xs font-bold whitespace-nowrap text-on-brand transition-colors hover:bg-brand-hover"
              >
                Registro
              </Link>
            </div>
          )}
        </Container>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>

      <PublicFooter />

      <button
        type="button"
        title="Disponible próximamente"
        className="fixed right-4 bottom-4 z-50 flex h-9 items-center gap-1.5 rounded-full bg-accent px-3.5 text-xs font-bold text-on-accent shadow-[var(--shadow-pop)] transition-colors hover:bg-accent-hover"
      >
        <SparkleIcon className="size-3.5" />
        Asistente inmobiliario
      </button>
    </div>
  );
}
