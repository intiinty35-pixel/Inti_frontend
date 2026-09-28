import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  /**
   * Nodo fijo dentro de la caja, a la izquierda del valor (p. ej. "S/"). Va
   * dentro del borde y con `overflow-hidden`, así nunca se sale de la caja.
   */
  leading?: ReactNode;
  disabled?: boolean;
}

export function Input({
  label,
  hint,
  error,
  leading,
  className,
  id,
  disabled,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-[13px] font-semibold text-brand">
          {label}
        </label>
      ) : null}
      <div
        className={cn(
          "flex h-11 w-full items-center overflow-hidden rounded-card border bg-surface transition-colors focus-within:border-brand focus-within:outline-2 focus-within:outline-brand/25",
          error ? "border-error focus-within:border-error focus-within:outline-error/25" : "border-edge",
          disabled ? "cursor-not-allowed bg-surface-muted" : "",
          className,
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
        <input
          id={inputId}
          disabled={disabled}
          className="h-full min-w-0 flex-1 bg-transparent px-3.5 text-sm text-ink outline-none placeholder:text-muted/70"
          {...props}
        />
      </div>
      {error ? <p className="text-xs text-error">{error}</p> : null}
      {hint && !error ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
