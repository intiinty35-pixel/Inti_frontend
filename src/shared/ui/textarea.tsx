import { useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  /** Muestra "n/max" bajo el campo. Solo es fiable con `value` controlado (react-hook-form). */
  maxLength?: number;
}

export function Textarea({
  label,
  hint,
  error,
  className,
  id,
  maxLength,
  rows = 4,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const countId = `${textareaId}-count`;

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={textareaId} className="text-[13px] font-semibold text-brand">
          {label}
        </label>
      ) : null}
      <textarea
        id={textareaId}
        rows={rows}
        aria-describedby={error ? undefined : hint || maxLength ? countId : undefined}
        aria-invalid={error ? true : undefined}
        className={cn(
          "rounded-card border border-edge bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-brand focus:outline-2 focus:outline-brand/25",
          error ? "border-error focus:outline-error" : "",
          className,
        )}
        {...props}
      />
      {error ? <p className="text-xs text-error">{error}</p> : null}
      {!error && (hint || maxLength) ? (
        <p id={countId} className="flex justify-between gap-3 text-xs text-muted">
          <span>{hint}</span>
          {maxLength ? (
            <span className="tabular-nums">
              {String(props.value ?? "").length}/{maxLength}
            </span>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
