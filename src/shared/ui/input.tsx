<<<<<<< HEAD
import { useId, type InputHTMLAttributes, type ReactNode } from "react";
=======
import { useId, type InputHTMLAttributes } from "react";
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
import { cn } from "@/shared/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
<<<<<<< HEAD
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
=======
}

export function Input({ label, hint, error, className, id, ...props }: InputProps) {
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-[13px] font-semibold text-brand">
          {label}
        </label>
      ) : null}
<<<<<<< HEAD
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
=======
      <input
        id={inputId}
        className={cn(
          "h-11 rounded-card border border-edge bg-surface px-3.5 text-sm text-ink placeholder:text-muted/70 focus:border-brand focus:outline-2 focus:outline-brand/25",
          error ? "border-error focus:outline-error" : "",
          className,
        )}
        {...props}
      />
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
      {error ? <p className="text-xs text-error">{error}</p> : null}
      {hint && !error ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
