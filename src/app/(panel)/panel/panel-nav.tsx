"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/cn";

export interface PanelNavModule {
  key: string;
  label: string;
  href: string;
}

export function PanelNav({ modules }: { modules: PanelNavModule[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
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
  );
}