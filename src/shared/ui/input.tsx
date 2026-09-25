import { useId, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({ label, hint, error, className, id, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn(
          "h-10 rounded-card border border-edge bg-surface px-3 text-sm text-ink placeholder:text-muted focus:outline-2 focus:outline-brand",
          error ? "border-error focus:outline-error" : "",
          className,
        )}
        {...props}
      />
      {error ? <p className="text-xs text-error">{error}</p> : null}
      {hint && !error ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}