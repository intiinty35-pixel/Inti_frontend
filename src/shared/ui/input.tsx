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
        <label htmlFor={inputId} className="text-[13px] font-semibold text-brand">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn(
          "h-11 rounded-card border border-edge bg-surface px-3.5 text-sm text-ink placeholder:text-muted/70 focus:border-brand focus:outline-2 focus:outline-brand/25",
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
