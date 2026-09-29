import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  labelClassName?: string;
}

export function Checkbox({ label, labelClassName, className, id, ...props }: CheckboxProps) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;

  return (
    <label htmlFor={checkboxId} className="flex items-start gap-2 text-xs text-muted">
      <input
        id={checkboxId}
        type="checkbox"
        className={cn("mt-0.5 size-3.5 shrink-0 accent-brand", className)}
        {...props}
      />
      <span className={labelClassName}>{label}</span>
    </label>
  );
}
