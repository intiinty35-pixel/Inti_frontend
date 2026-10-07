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

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter((item) => {
    return item === 1 || item === totalPages || Math.abs(item - page) <= 1;
  });

  return (
    <nav aria-label="Paginacion" className="flex max-w-full flex-wrap items-center justify-center gap-1.5 overflow-hidden">
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
      {pages.map((item, index) => {
        const previous = pages[index - 1];
        const hasGap = previous !== undefined && item - previous > 1;

        return (
          <span key={item} className="contents">
            {hasGap ? (
              <span className="flex h-9 min-w-6 items-center justify-center text-sm font-bold text-muted">
                ...
              </span>
            ) : null}
            <Link
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
          </span>
        );
      })}
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

