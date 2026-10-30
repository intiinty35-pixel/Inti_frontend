"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { Button, ChevronDownIcon } from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import { ROUTES } from "@/shared/config/routes";
import { CustomerNav } from "@/app/(panel)/panel/client/customer-nav";

export interface CustomerShellProps {
  name: string;
  roleLabel: string;
  avatarUrl: string | null;
  children: ReactNode;
}

export function CustomerShell({ name, roleLabel, avatarUrl, children }: CustomerShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const initial = name.trim().charAt(0).toUpperCase() || "A";

  return (
    <div className="min-h-screen bg-canvas">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 hidden flex-col border-r border-edge bg-surface shadow-[var(--shadow-card)] transition-[width] duration-300 lg:flex",
          collapsed ? "w-[72px] p-3" : "w-[260px] p-5",
        )}
      >
        <div className={cn("flex h-12 items-center", collapsed ? "justify-center" : "justify-between gap-3")}>
          <Link href={ROUTES.home} className="flex min-w-0 items-center" aria-label="Inti Proyectos">
            {collapsed ? (
              <span className="flex size-10 items-center justify-center rounded-lg bg-brand text-sm font-black text-on-brand">
                AR
              </span>
            ) : (
              <Image src="/logo/logo.png" alt="Inti Proyectos" width={144} height={40} className="h-10 w-auto" style={{ width: "auto" }} />
            )}
          </Link>
          {!collapsed ? (
            <button
              type="button"
              aria-label="Contraer sidebar"
              onClick={() => setCollapsed(true)}
              className="flex size-9 items-center justify-center rounded-lg border border-edge text-muted transition-colors hover:border-brand hover:text-brand"
            >
              <ChevronDownIcon className="size-4 rotate-90" />
            </button>
          ) : null}
        </div>

        {collapsed ? (
          <button
            type="button"
            aria-label="Expandir sidebar"
            onClick={() => setCollapsed(false)}
            className="mt-4 flex size-10 items-center justify-center rounded-lg border border-edge text-muted transition-colors hover:border-brand hover:text-brand"
          >
            <ChevronDownIcon className="size-4 -rotate-90" />
          </button>
        ) : (
          <p className="mt-4 px-2 text-[10px] font-bold tracking-[0.22em] text-muted uppercase">
            Panel de usuario
          </p>
        )}


        <div className="mt-4 flex-1 overflow-y-auto">
          <CustomerNav collapsed={collapsed} />
        </div>

        <div className="mt-4 flex flex-col gap-1 border-t border-edge pt-3">
          <Link
            href={ROUTES.home}
            title={collapsed ? "Ver portal publico" : undefined}
            className={cn(
              "flex h-11 items-center rounded-lg text-sm font-medium text-muted transition-colors hover:bg-surface-muted hover:text-ink",
              collapsed ? "justify-center px-0" : "gap-3 px-3",
            )}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-edge text-[11px] font-black">
              AR
            </span>
            {!collapsed ? <span className="truncate">Ver portal publico</span> : null}
          </Link>
          {!collapsed ? <LogoutButton /> : null}
        </div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menu"
            className="absolute inset-0 bg-ink/30"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-[280px] flex-col gap-5 border-r border-edge bg-surface p-5 shadow-[var(--shadow-pop)]">
            <Link href={ROUTES.home} className="flex h-12 items-center" aria-label="Inti Proyectos">
              <Image src="/logo/logo.png" alt="Inti Proyectos" width={144} height={40} className="h-10 w-auto" style={{ width: "auto" }} />
            </Link>
            <p className="px-2 text-[10px] font-bold tracking-[0.22em] text-muted uppercase">Panel de usuario</p>
            <div className="flex-1 overflow-y-auto">
              <CustomerNav mobile onNavigate={() => setMobileOpen(false)} />
            </div>
            <LogoutButton />
          </aside>
        </div>
      ) : null}

      <div
        className={cn(
          "min-w-0 transition-[padding-left] duration-300",
          collapsed ? "lg:pl-[72px]" : "lg:pl-[260px]",
        )}
      >
        <header className="sticky top-0 z-40 flex min-h-20 items-center justify-between gap-4 border-b border-edge bg-surface/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Abrir menu"
              onClick={() => setMobileOpen(true)}
              className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-edge text-brand lg:hidden"
            >
              AR
            </button>
            <div className="min-w-0">
              <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">Panel de usuario</p>
              <p className="truncate text-sm font-semibold text-ink">Gestiona tus favoritos, propiedades y membresía</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <Link href={ROUTES.home}>
              <Button variant="secondary" size="sm" className="hidden sm:inline-flex">
                Ver portal
              </Button>
            </Link>
            <Link
              href={ROUTES.panel.client.profile}
              aria-label="Abrir mi perfil"
              className="flex min-h-12 items-center gap-2.5 rounded-xl border border-edge bg-surface px-2 py-1.5 transition-colors hover:border-brand hover:shadow-[var(--shadow-card)] sm:px-3"
            >
              {avatarUrl ? (
                <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-accent bg-surface shadow-sm">
                  <Image
                    src={avatarUrl}
                    alt={`${name}, foto de perfil`}
                    width={40}
                    height={40}
                    unoptimized
                    className="size-full object-cover"
                  />
                </span>
              ) : (
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-accent bg-brand-soft font-bold text-brand">
                  {initial}
                </span>
              )}
              <span className="flex min-w-0 max-w-36 flex-col text-left leading-tight sm:max-w-48">
                <span className="truncate text-[10px] font-bold tracking-wide text-muted uppercase">Mi perfil</span>
                <span className="truncate text-sm font-semibold text-ink">{name}</span>
                <span className="hidden text-[11px] text-muted sm:block">{roleLabel}</span>
              </span>
            </Link>
          </div>
        </header>

        <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export function CustomerPageHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-6">
      <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">{eyebrow}</p>
      <h1 className="mt-1 text-3xl font-light tracking-tight text-brand">{title}</h1>
    </div>
  );
}
