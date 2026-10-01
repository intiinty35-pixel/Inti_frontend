"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/shared/ui/container";
import { MenuIcon, XIcon } from "@/shared/ui/icons";
import { ROUTES, hasOverlayHeader } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { PublicMobileNav, PublicNav } from "@/app/(public)/public-nav";

export interface PublicHeaderProps {
  isLoggedIn: boolean;
  accountName?: string;
  accountHref: string;
}

function Logo() {
  return (
    <Link href={ROUTES.home} className="flex items-center gap-2.5" aria-label="Ariz Proyectos">
      <img src="/logo/logo.png" alt="Ariz Proyectos" className="h-9 w-auto" />
    </Link>
  );
}

/**
 * Cabecera del sitio publico.
 *
 * Arriba del todo el header es transparente y el texto va en blanco, para que
 * se vea el fondo del hero (el carrusel del home o el azul de servicios). Ese
 * estilo solo tiene sentido sobre un hero oscuro, asi que se decide por ruta
 * con `hasOverlayHeader`: en el resto de paginas el header es solido y el texto
 * vuelve a azul de marca.
 *
 * Al scrollear, el contenido pasa por debajo del header transparente. Por eso
 * en las rutas con hero el header gana un velo oscuro y un blur al pasar de la
 * cabecera: el texto blanco sigue siendo legible sobre cualquier seccion.
 *
 * En movil el nav no cabe en linea, asi que se colapsa detras del boton de
 * hamburguesa. El panel es una sola fila de 60px sobre la cabecera, que es lo
 * que mide `--header-h`.
 */
export function PublicHeader({ isLoggedIn, accountName, accountHref }: PublicHeaderProps) {
  const pathname = usePathname();
  const overlay = hasOverlayHeader(pathname);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sync = () => setScrolled(window.scrollY > 8);
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, []);

  // Navegar es la forma natural de cerrar el menu (los enlaces del panel ya lo
  // cierran), pero el atras/adelante del navegador no pasa por ahi. Se ajusta
  // durante el render en vez de en un effect para no provocar un segundo render.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // Con el header transparente arriba y un velo al scrollear, ambas variantes
  // comparten texto blanco: solo cambia el fondo.
  const solid = !overlay;
  const translucent = overlay && scrolled;

  const accountClass = (filled: boolean) =>
    cn(
      "flex h-10 items-center justify-center rounded-card border px-4 text-xs font-bold whitespace-nowrap transition-colors",
      filled
        ? solid
          ? "bg-brand text-on-brand hover:bg-brand-hover"
          : "bg-accent text-on-accent hover:bg-accent-hover"
        : solid
          ? "border-edge bg-surface text-brand hover:border-brand"
          : "border-white/35 bg-white/10 text-white hover:border-white/70 hover:bg-white/15",
    );

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-300",
        solid && "border-edge bg-surface/95 backdrop-blur",
        !solid && !translucent && "border-white/15 bg-transparent",
        translucent && "border-white/10 bg-ink/55 backdrop-blur-md",
        menuOpen && "bg-surface",
      )}
    >
      <Container size="wide" className="flex h-[60px] items-center justify-between gap-x-6">
        <Logo />

        {/*
          Orden de las tres piezas visibles en escritorio: logo a la izquierda,
          nav al centro y sesion a la derecha. El `justify-between` del
          contenedor reparte solo los hijos visibles, asi que basta con el orden
          del DOM: el bloque de sesion va despues del nav para no caer al medio.
          En movil el nav y el bloque de sesion estan ocultos (`lg:*`) y solo
          quedan logo y boton de menu, que se separan igual.
        */}
        <div className="hidden h-full items-stretch lg:flex">
          <PublicNav overlay={!solid} />
        </div>

        {isLoggedIn ? (
          <Link
            href={accountHref}
            title={accountName}
            className={cn(
              "hidden h-10 max-w-52 items-center truncate rounded-card border px-4 text-xs font-bold transition-colors lg:inline-flex",
              solid
                ? "border-edge bg-surface text-brand hover:border-brand"
                : "border-white/35 bg-white/10 text-white hover:border-white/70 hover:bg-white/15",
            )}
          >
            {accountName}
          </Link>
        ) : (
          <div className="hidden grid-cols-2 gap-2 lg:grid">
            <Link href={ROUTES.login} className={accountClass(false)}>
              Iniciar sesión
            </Link>
            {/*
              Sobre el hero oscuro el azul de marca no se distingue del fondo,
              asi que el registro pasa a amarillo, que es el acento de la marca.
            */}
            <Link href={ROUTES.register} className={accountClass(true)}>
              Registro
            </Link>
          </div>
        )}

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="public-mobile-menu"
          aria-label={menuOpen ? "Cerrar menu" : "Abrir menu"}
          className={cn(
            "flex size-10 items-center justify-center rounded-card border transition-colors lg:hidden",
            menuOpen
              ? "border-edge bg-surface text-brand"
              : solid
                ? "border-edge bg-surface text-brand"
                : "border-white/35 bg-white/10 text-white hover:bg-white/15",
          )}
        >
          {menuOpen ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
        </button>
      </Container>

      {/*
        El panel cuelga de la cabecera y se desplaza con ella (`sticky`), asi que
        el alto de scroll se le resta para que nunca tape el footer entero.
      */}
      {menuOpen ? (
        <div
          id="public-mobile-menu"
          className="max-h-[calc(100dvh-var(--header-h)) overflow-y-auto border-t border-edge bg-surface text-brand shadow-[var(--shadow-pop)] lg:hidden"
        >
          <PublicMobileNav onNavigate={() => setMenuOpen(false)} />

          <div className="border-t border-edge p-4">
            {isLoggedIn ? (
              <Link
                href={accountHref}
                onClick={() => setMenuOpen(false)}
                className="flex h-11 items-center justify-center rounded-card bg-brand px-4 text-sm font-bold text-on-brand"
              >
                {accountName ?? "Mi cuenta"}
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={ROUTES.login}
                  onClick={() => setMenuOpen(false)}
                  className="flex h-11 items-center justify-center rounded-card border border-edge px-4 text-sm font-bold text-brand"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href={ROUTES.register}
                  onClick={() => setMenuOpen(false)}
                  className="flex h-11 items-center justify-center rounded-card bg-accent px-4 text-sm font-bold text-on-accent"
                >
                  Registro
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}