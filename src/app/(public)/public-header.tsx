"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Heart, LogIn, UserRound } from "lucide-react";
import { Container } from "@/shared/ui/container";
import { MenuIcon, XIcon } from "@/shared/ui/icons";
import { ROUTES, hasOverlayHeader } from "@/shared/config/routes";
import type { UserRole } from "@/shared/config/roles";
import { cn } from "@/shared/lib/cn";
import { PublicMobileNav, PublicNav } from "@/app/(public)/public-nav";

export interface PublicHeaderProps {
  isLoggedIn: boolean;
  accountName?: string;
  accountAvatarUrl?: string;
  accountHref: string;
  accountRole?: UserRole;
}

function Logo({ light }: { light: boolean }) {
  return (
    <Link href={ROUTES.home} className="flex items-center gap-2.5" aria-label="Ariz Proyectos">
      <img
        src="/logo/logo.png"
        alt="Ariz Proyectos"
        className={cn("h-12 w-auto", light && "drop-shadow-[0_0_2px_rgb(255_255_255_/_0.95)]")}
      />
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
export function PublicHeader({
  isLoggedIn,
  accountName,
  accountAvatarUrl,
  accountHref,
  accountRole,
}: PublicHeaderProps) {
  const pathname = usePathname();
  const overlay = hasOverlayHeader(pathname);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const desktopAccountMenuRef = useRef<HTMLDivElement>(null);
  const mobileAccountMenuRef = useRef<HTMLDivElement>(null);
  const isCustomer = isLoggedIn && accountRole === "USER";

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
    setAccountMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen && !accountMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setAccountMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, accountMenuOpen]);

  useEffect(() => {
    if (!accountMenuOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !desktopAccountMenuRef.current?.contains(target) &&
        !mobileAccountMenuRef.current?.contains(target)
      ) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [accountMenuOpen]);

  // Con el header transparente arriba y un velo al scrollear, ambas variantes
  // comparten texto blanco: solo cambia el fondo.
  const solid = !overlay;
  const translucent = overlay && scrolled;

  const accountClass = (filled: boolean) =>
    cn(
      "flex h-10 items-center justify-center rounded-card border px-4 text-sm font-black whitespace-nowrap transition-colors",
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
        "sticky top-0 border-b transition-colors duration-300",
        menuOpen
          ? "z-[110] border-edge bg-white"
          : cn(
              "z-50",
              solid && "border-edge bg-surface/95 backdrop-blur",
              !solid && !translucent && "border-transparent bg-transparent",
              translucent && "border-transparent bg-ink/55 backdrop-blur-md",
            ),
      )}
      style={{ position: 'sticky' }}
    >
      <Container size="wide" className="flex h-[72px] items-center justify-between gap-x-6">
         <Logo light={!solid} />

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

        {isCustomer ? (
          <div className="hidden items-center gap-2 lg:flex">
            <Link href={ROUTES.registerProfessional} className={accountClass(true)}>
              Publicar propiedad
            </Link>
            <div className="relative" ref={desktopAccountMenuRef}>
              <button
                type="button"
                aria-label="Administrar mi cuenta"
                aria-expanded={accountMenuOpen}
                aria-controls="customer-account-menu"
                title="Administrar mi cuenta"
                onClick={() => setAccountMenuOpen((open) => !open)}
                className={cn(
                  "relative flex size-10 items-center justify-center overflow-hidden border transition-colors",
                  accountAvatarUrl
                    ? "rounded-full border-accent p-0 ring-2 ring-accent/20"
                    : "rounded-card",
                  solid
                    ? accountAvatarUrl
                      ? "bg-surface text-brand hover:border-brand"
                      : "border-edge bg-surface text-brand hover:border-brand"
                    : accountAvatarUrl
                      ? "bg-white/10 text-white hover:border-white/70 hover:bg-white/15"
                      : "border-white/35 bg-white/10 text-white hover:border-white/70 hover:bg-white/15",
                )}
              >
                {accountAvatarUrl ? (
                  <Image
                    src={accountAvatarUrl}
                    alt=""
                    width={40}
                    height={40}
                    unoptimized
                    className="block size-full rounded-full object-cover"
                  />
                ) : (
                  <UserRound className="size-5" />
                )}
              </button>
              {accountMenuOpen ? (
                <div
                  id="customer-account-menu"
                  className="absolute top-full right-0 z-50 mt-3 w-64 overflow-hidden rounded-xl border border-edge bg-surface p-2 text-brand shadow-[var(--shadow-pop)]"
                >
                  <div className="border-b border-edge px-3 py-2.5">
                    <p className="text-[11px] font-bold tracking-[0.12em] text-muted uppercase">
                      Administra mi cuenta
                    </p>
                    {accountName ? (
                      <p className="mt-1 truncate text-sm font-bold text-brand">{accountName}</p>
                    ) : null}
                  </div>
                  <Link
                    href={accountHref}
                    onClick={() => setAccountMenuOpen(false)}
                    className="mt-1 flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-surface-muted"
                  >
                    Mi cuenta
                    <ChevronDown className="size-4 -rotate-90 text-muted" />
                  </Link>
                  <Link
                    href={ROUTES.panel.client.favorites}
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-surface-muted"
                  >
                    <span className="flex items-center gap-2">
                      <Heart className="size-4 text-accent" />
                      Mis favoritos
                    </span>
                    <ChevronDown className="size-4 -rotate-90 text-muted" />
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        ) : isLoggedIn ? (
          <Link
            href={accountHref}
            title={accountName}
            className={cn(
              "hidden h-10 max-w-52 items-center truncate rounded-card border px-4 text-sm font-black transition-colors lg:inline-flex",
              solid
                ? "border-edge bg-surface text-brand hover:border-brand"
                : "border-white/35 bg-white/10 text-white hover:border-white/70 hover:bg-white/15",
            )}
          >
            {accountName}
          </Link>
        ) : (
          <div className="hidden grid-cols-2 gap-2 lg:grid">
            <Link
              href={ROUTES.login}
              className={cn(
                "flex h-10 items-center justify-center gap-2 rounded-card border px-4 text-sm font-black whitespace-nowrap transition-colors",
                solid
                  ? "border-[#25d366] bg-[#25d366]/10 text-[#168a43] hover:border-[#1fb857] hover:bg-[#25d366]/20"
                  : "border-[#25d366] bg-[#25d366] text-white shadow-[0_8px_20px_-8px_rgb(37_211_102_/_0.7)] hover:bg-[#1fb857]",
              )}
            >
              <span>Iniciar sesión</span>
              <LogIn className="size-4 shrink-0 translate-y-0.5" aria-hidden="true" />
            </Link>
            {/*
              Sobre el hero oscuro el azul de marca no se distingue del fondo,
              asi que el registro pasa a amarillo, que es el acento de la marca.
            */}
            <Link href={ROUTES.registerProfessional} className={accountClass(true)}>
              Publicar propiedad
            </Link>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2 lg:hidden">
          {isCustomer ? (
            <div className="relative" ref={mobileAccountMenuRef}>
              <button
                type="button"
                aria-label="Administrar mi cuenta"
                aria-expanded={accountMenuOpen}
                aria-controls="customer-account-menu-mobile"
                title="Administrar mi cuenta"
                onClick={() => setAccountMenuOpen((open) => !open)}
                className={cn(
                  "relative flex size-10 items-center justify-center overflow-hidden border transition-colors",
                  accountAvatarUrl
                    ? "rounded-full border-accent p-0 ring-2 ring-accent/20"
                    : "rounded-card",
                  solid
                    ? accountAvatarUrl
                      ? "bg-surface text-brand"
                      : "border-edge bg-surface text-brand"
                    : accountAvatarUrl
                      ? "bg-white/10 text-white"
                      : "border-white/35 bg-white/10 text-white",
                )}
              >
                {accountAvatarUrl ? (
                  <Image
                    src={accountAvatarUrl}
                    alt=""
                    width={40}
                    height={40}
                    unoptimized
                    className="block size-full rounded-full object-cover"
                  />
                ) : (
                  <UserRound className="size-5" />
                )}
              </button>
              {accountMenuOpen ? (
                <div
                  id="customer-account-menu-mobile"
                  className="absolute top-full right-0 z-50 mt-3 w-64 overflow-hidden rounded-xl border border-edge bg-surface p-2 text-brand shadow-[var(--shadow-pop)]"
                >
                  <div className="border-b border-edge px-3 py-2.5">
                    <p className="text-[11px] font-bold tracking-[0.12em] text-muted uppercase">
                      Administra mi cuenta
                    </p>
                    {accountName ? (
                      <p className="mt-1 truncate text-sm font-bold text-brand">{accountName}</p>
                    ) : null}
                  </div>
                  <Link
                    href={accountHref}
                    onClick={() => setAccountMenuOpen(false)}
                    className="mt-1 flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-surface-muted"
                  >
                    Mi cuenta
                    <ChevronDown className="size-4 -rotate-90 text-muted" />
                  </Link>
                  <Link
                    href={ROUTES.panel.client.favorites}
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-surface-muted"
                  >
                    <span className="flex items-center gap-2">
                      <Heart className="size-4 text-accent" />
                      Mis favoritos
                    </span>
                    <ChevronDown className="size-4 -rotate-90 text-muted" />
                  </Link>
                </div>
              ) : null}
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => {
              setMenuOpen((open) => !open);
              setAccountMenuOpen(false);
            }}
            aria-expanded={menuOpen}
            aria-controls="public-mobile-menu"
            aria-label={menuOpen ? "Cerrar menu" : "Abrir menu"}
            className={cn(
              "flex size-10 items-center justify-center rounded-card border transition-colors lg:hidden",
              menuOpen
                ? "border-edge bg-surface text-brand hover:bg-surface-muted"
                : solid
                  ? "border-edge bg-surface text-brand hover:bg-surface-muted"
                  : "border-white/35 bg-white/10 text-white hover:bg-white/15",
            )}
          >
            {menuOpen ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </Container>

      {/*
        Overlay para oscurecer el contenido detrás cuando el menú está abierto
      */}
      {menuOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
          style={{ top: 'var(--header-h)' }}
        />
      ) : null}

      {/*
        El panel cuelga de la cabecera posicionado absolutamente para no empujar el Hero abajo.
        Se posiciona justo debajo del header sticky con `top-full`.
      */}
      {menuOpen ? (
        <div
          id="public-mobile-menu"
          className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-var(--header-h))] overflow-y-auto border-t border-edge bg-surface text-brand shadow-[var(--shadow-pop)] lg:hidden"
        >
          <PublicMobileNav onNavigate={() => setMenuOpen(false)} />

          <div className="border-t border-edge p-4">
            {isCustomer ? (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={accountHref}
                  onClick={() => setMenuOpen(false)}
                  className="flex h-11 items-center justify-center rounded-card border border-edge px-3 text-sm font-bold text-brand"
                >
                  Mi cuenta
                </Link>
                <Link
                  href={ROUTES.registerProfessional}
                  onClick={() => setMenuOpen(false)}
                  className="flex h-11 items-center justify-center rounded-card bg-accent px-3 text-sm font-bold text-on-accent"
                >
                  Publicar propiedad
                </Link>
                <Link
                  href={ROUTES.panel.client.favorites}
                  onClick={() => setMenuOpen(false)}
                  className="col-span-2 flex h-11 items-center justify-center gap-2 rounded-card bg-brand px-3 text-sm font-bold text-on-brand"
                >
                  <Heart className="size-4" />
                  Mis favoritos
                </Link>
              </div>
            ) : isLoggedIn ? (
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
                  className="flex h-11 items-center justify-center gap-2 rounded-card border border-[#25d366] bg-[#25d366] px-4 text-sm font-bold text-white transition-colors hover:bg-[#1fb857]"
                >
                  <span>Iniciar sesión</span>
                  <LogIn className="size-4 shrink-0 translate-y-0.5" aria-hidden="true" />
                </Link>
                <Link
                  href={ROUTES.registerProfessional}
                  onClick={() => setMenuOpen(false)}
                  className="flex h-11 items-center justify-center rounded-card bg-accent px-4 text-sm font-bold text-on-accent"
                >
                  Publicar propiedad
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
