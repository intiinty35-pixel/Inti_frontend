"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export interface PanelNavModule {
  key: string;
  label: string;
  href: string;
}

export function PanelNav({ modules }: { modules: PanelNavModule[] }) {
  const pathname = usePathname();
  const activeLabel =
    modules.find((module) => pathname === module.href)?.label ?? "Navegación";

  return (
    <>
      <details className="group md:hidden">
        <summary className="flex h-11 cursor-pointer list-none items-center justify-between rounded-card border border-edge bg-surface px-3 text-sm font-semibold text-brand [&::-webkit-details-marker]:hidden">
          <span>{activeLabel}</span>
          <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
        </summary>
        <nav className="mt-2 grid grid-cols-2 gap-1 rounded-card border border-edge bg-surface p-2">
          {modules.map((module) => (
            <Link
              key={module.key}
              href={module.href}
              className={cn(
                "rounded-card px-3 py-2 text-sm font-medium transition-colors",
                pathname === module.href
                  ? "bg-brand-soft text-brand"
                  : "text-muted hover:bg-surface-muted hover:text-ink",
              )}
            >
              {module.label}
            </Link>
          ))}
        </nav>
      </details>
      <nav className="hidden flex-col gap-1 md:flex">
        {modules.map((module) => (
          <Link
            key={module.key}
            href={module.href}
            className={cn(
              "rounded-card px-3 py-2 text-sm font-medium transition-colors",
              pathname === module.href
                ? "bg-brand-soft text-brand"
                : "text-muted hover:bg-surface-muted hover:text-ink",
            )}
          >
            {module.label}
          </Link>
        ))}
      </nav>
    </>
  );
}