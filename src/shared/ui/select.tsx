import { useId, type SelectHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Select({ label, hint, error, className, id, children, ...props }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={selectId} className="text-[13px] font-semibold text-brand">
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        className={cn(
          "h-11 rounded-card border border-edge bg-surface px-3 text-sm text-ink focus:border-brand focus:outline-2 focus:outline-brand/25",
          error ? "border-error focus:outline-error" : "",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="text-xs text-error">{error}</p> : null}
      {hint && !error ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
