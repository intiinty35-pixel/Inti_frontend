import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  trailing?: ReactNode;
  containerClassName?: string;
  /** Nodos decorativos opcionales dentro del campo. */
  leading?: ReactNode;
}

export function Input({
  label,
  hint,
  error,
  leading,
  trailing,
  containerClassName,
  className,
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const field = (
    <input
      id={inputId}
      className={cn(
        "h-11 rounded-card border border-edge bg-surface px-3.5 text-sm text-ink placeholder:text-muted/70 focus:border-brand focus:outline-2 focus:outline-brand/25",
        leading || trailing
          ? "h-full min-w-0 flex-1 rounded-none border-0 bg-transparent focus:outline-none"
          : "",
        error ? "border-error focus:outline-error" : "",
        className,
      )}
      {...props}
    />
  );

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-[13px] font-semibold text-brand">
          {label}
        </label>
      ) : null}
      {leading || trailing ? (
        <div
          className={cn(
            "flex h-11 w-full items-center overflow-hidden rounded-card border bg-surface transition-colors focus-within:border-brand focus-within:outline-2 focus-within:outline-brand/25",
            error ? "border-error focus-within:border-error focus-within:outline-error/25" : "border-edge",
            containerClassName,
          )}
        >
          {leading ? (
            <span
              aria-hidden
              className="pointer-events-none shrink-0 pl-3.5 text-sm font-semibold text-muted select-none"
            >
              {leading}
            </span>
          ) : null}
          {field}
          {trailing}
        </div>
      ) : (
        field
      )}
      {error ? <p className="text-xs text-error">{error}</p> : null}
      {hint && !error ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
