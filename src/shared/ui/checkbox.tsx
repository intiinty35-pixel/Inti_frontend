import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
<<<<<<< HEAD
  labelClassName?: string;
}

export function Checkbox({ label, labelClassName, className, id, ...props }: CheckboxProps) {
=======
}

export function Checkbox({ label, className, id, ...props }: CheckboxProps) {
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
  const generatedId = useId();
  const checkboxId = id ?? generatedId;

  return (
    <label htmlFor={checkboxId} className="flex items-start gap-2 text-xs text-muted">
      <input
        id={checkboxId}
        type="checkbox"
<<<<<<< HEAD
        className={cn("mt-0.5 size-3.5 shrink-0 cursor-pointer accent-brand", className)}
        {...props}
      />
      <span className={labelClassName}>{label}</span>
=======
        className={cn("mt-0.5 size-3.5 shrink-0 accent-brand", className)}
        {...props}
      />
      <span>{label}</span>
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
    </label>
  );
}
