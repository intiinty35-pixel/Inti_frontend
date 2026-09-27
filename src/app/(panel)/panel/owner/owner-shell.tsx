import type { ReactNode } from "react";
import Link from "next/link";
import { LogoutButton } from "@/features/auth";
import { Button } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { OwnerNav } from "@/app/(panel)/panel/owner/owner-nav";

export interface OwnerShellProps {
  name: string;
  roleLabel: string;
  children: ReactNode;
}

export function OwnerShell({ name, roleLabel, children }: OwnerShellProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "A";

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 flex w-64 flex-col gap-6 bg-brand p-5 text-white">
        <Link href={ROUTES.home} className="flex items-center gap-2" aria-label="Ariz Proyectos">
          <span className="text-2xl leading-none font-black text-accent">A</span>
          <span className="text-lg font-extrabold tracking-wide">
            ARIZ
            <span className="block text-[8px] font-bold tracking-[0.2em] text-white/70">
              PROYECTOS
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent font-bold text-on-accent">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="text-xs text-white/60">{roleLabel}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <OwnerNav />
        </div>

        <div className="flex flex-col gap-1 border-t border-white/10 pt-4">
          <Link
            href={ROUTES.home}
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white"
          >
            Ver portal público
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <div className="pl-64">
        <header className="flex h-16 items-center justify-between border-b border-edge bg-surface px-8">
          <div>
            <p className="text-sm font-semibold text-brand">Panel profesional</p>
            <p className="text-xs text-muted">{name}</p>
          </div>
          <Link href={ROUTES.home}>
            <Button variant="secondary" size="sm">
              Ver portal
            </Button>
          </Link>
        </header>

        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

export function OwnerPageHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-6">
      <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">{eyebrow}</p>
      <h1 className="mt-1 text-3xl font-light tracking-tight text-brand">{title}</h1>
    </div>
  );
}
