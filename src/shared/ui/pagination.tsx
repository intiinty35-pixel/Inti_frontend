import Link from "next/link";
import { cn } from "@/shared/lib/cn";

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  buildHref: (page: number) => string;
}

export function Pagination({ page, pageSize, total, buildHref }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-1.5">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn(
          "flex h-9 min-w-9 items-center justify-center rounded-card border border-edge px-3 text-sm font-medium",
          page === 1
            ? "pointer-events-none opacity-40"
            : "text-ink hover:border-brand",
        )}
      >
        Anterior
      </Link>
      {pages.map((item) => (
        <Link
          key={item}
          href={buildHref(item)}
          aria-current={item === page ? "page" : undefined}
          className={cn(
            "flex h-9 min-w-9 items-center justify-center rounded-card border px-3 text-sm font-medium",
            item === page
              ? "border-brand bg-brand-soft text-brand"
              : "border-edge text-ink hover:border-brand",
          )}
        >
          {item}
        </Link>
      ))}
      <Link
        href={buildHref(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={cn(
          "flex h-9 min-w-9 items-center justify-center rounded-card border border-edge px-3 text-sm font-medium",
          page === totalPages
            ? "pointer-events-none opacity-40"
            : "text-ink hover:border-brand",
        )}
      >
        Siguiente
      </Link>
    </nav>
  );
}
