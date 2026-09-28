import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export interface DataGridProps {
  children: ReactNode;
  columns?: 2 | 4;
  className?: string;
}

const COLUMNS = {
  2: "grid-cols-2 gap-x-2",
  4: "grid-cols-4 gap-x-2",
} as const;

/** Ficha técnica: 4 columnas de label + valor, o 2 cuando los valores son largos. */
export function DataGrid({ children, columns = 2, className }: DataGridProps) {
  return (
    <dl
      className={cn(
        "grid gap-y-0.5 border-t border-edge pt-1.5",
        COLUMNS[columns],
        className,
      )}
    >
      {children}
    </dl>
  );
}

export interface DataCellProps {
  label: string;
  value: ReactNode;
  className?: string;
}

export function DataCell({ label, value, className }: DataCellProps) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return (
    <div className={cn("min-w-0", className)}>
      <dt className="truncate text-[9px] font-bold tracking-[0.06em] text-muted uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 line-clamp-2 text-[11px] font-semibold text-ink">{value}</dd>
    </div>
  );
}
