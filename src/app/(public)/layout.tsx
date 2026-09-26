import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/shared/ui/container";
import { SparkleIcon } from "@/shared/ui";
import { getHomeRoute, ROUTES } from "@/shared/config/routes";
import { getSession } from "@/features/auth";
import { PublicNav } from "@/app/(public)/public-nav";

function Logo() {
  return (
    <Link href={ROUTES.home} className="flex items-center gap-2.5" aria-label="Ariz Proyectos">
      <span className="flex size-9 items-center justify-center rounded-md bg-brand text-xl leading-none font-black text-accent">
        A
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-lg font-extrabold tracking-wide text-brand">ARIZ</span>
        <span className="mt-0.5 text-[7px] font-bold tracking-[0.22em] text-brand">PROYECTOS</span>
      </span>
    </Link>
  );
}

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

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

          <div className="flex items-center gap-4 text-xs font-bold text-brand">
            {session ? (
              <Link
                href={getHomeRoute(session.role)}
                className="flex h-9 items-center rounded-lg bg-brand px-4 text-on-brand transition-colors hover:bg-brand-hover"
              >
                Mi panel
              </Link>
            ) : (
              <>
                <Link href={ROUTES.registerProfessional} className="hidden whitespace-nowrap sm:block">
                  Soy Agente / Inmobiliaria
                </Link>
                <Link href={ROUTES.login} className="whitespace-nowrap">
                  Iniciar sesión
                </Link>
                <Link
                  href={ROUTES.register}
                  className="flex h-9 items-center rounded-lg bg-brand px-4 text-on-brand transition-colors hover:bg-brand-hover"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </Container>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>

      <footer className="border-t border-edge bg-surface">
        <Container size="wide" className="flex h-14 items-center justify-between text-sm text-muted">
          <span>Ariz Proyectos</span>
          <span>© {new Date().getFullYear()} Ariz Proyectos</span>
        </Container>
      </footer>

      <button
        type="button"
        title="Disponible próximamente"
        className="fixed right-5 bottom-5 z-50 flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-bold text-on-accent shadow-[var(--shadow-pop)] transition-colors hover:bg-accent-hover"
      >
        <SparkleIcon className="size-4" />
        Asistente inmobiliario
      </button>
    </div>
  );
}
