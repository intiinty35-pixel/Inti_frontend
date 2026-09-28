"use client";

import type { FieldPath, FieldValues, PathValue } from "react-hook-form";
import { useFormContext, useWatch } from "react-hook-form";
import { CheckIcon } from "@/shared/ui/icons";
import { cn } from "@/shared/lib/cn";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  /** Opción anunciada pero aún no disponible, con el patrón "Próximamente" del repo. */
  comingSoon?: boolean;
}

const COLUMN_COUNT = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
} as const;

export interface RadioGroupProps<T extends FieldValues> {
  name: FieldPath<T>;
  options: readonly RadioOption[];
  ariaLabel: string;
  columns?: keyof typeof COLUMN_COUNT;
  className?: string;
}

export function RadioGroup<T extends FieldValues>({
  name,
  options,
  ariaLabel,
  columns = 3,
  className,
}: RadioGroupProps<T>) {
  const { register } = useFormContext<T>();
  const selected = useWatch({ name }) as string | undefined;

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("grid gap-2", COLUMN_COUNT[columns], className)}
    >
      {options.map((option) => {
        const active = selected === option.value;

        return (
          <label
            key={option.value}
            title={option.comingSoon ? "Disponible próximamente" : undefined}
            className={cn(
              "flex min-h-11 flex-col justify-center gap-0.5 rounded-card border px-3 py-2 text-left transition-colors",
              option.comingSoon
                ? "cursor-not-allowed border-dashed border-edge bg-surface-muted/60"
                : "cursor-pointer",
              active
                ? "border-brand bg-brand-soft"
                : option.comingSoon
                  ? ""
                  : "border-edge bg-surface hover:border-brand/50",
            )}
          >
            <input
              type="radio"
              value={option.value}
              disabled={option.comingSoon}
              {...register(name)}
              className="sr-only"
            />
            <span
              className={cn(
                "text-[13px] font-semibold",
                active ? "text-brand" : option.comingSoon ? "text-muted" : "text-ink",
              )}
            >
              {option.label}
            </span>
            {option.description ? (
              <span className="text-[11px] text-muted">{option.description}</span>
            ) : null}
            {option.comingSoon ? (
              <span className="text-[9px] font-bold tracking-[0.12em] text-muted uppercase">
                Próximamente
              </span>
            ) : null}
          </label>
        );
      })}
    </div>
  );
}

export interface ChipOption {
  value: string;
  label: string;
}

export interface ChipGroupProps<T extends FieldValues> {
  name: FieldPath<T>;
  options: readonly ChipOption[];
  className?: string;
}

/**
 * Casillas de selección múltiple. Controlado con `useWatch` para alternar
 * valores dentro del array que react-hook-form guarda en `name`.
 */
export function ChipGroup<T extends FieldValues>({ name, options, className }: ChipGroupProps<T>) {
  const { setValue, getValues } = useFormContext<T>();
  const selected = (useWatch({ name }) as string[] | undefined) ?? [];

  function toggle(value: string) {
    const current = (getValues(name) as string[] | undefined) ?? [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    setValue(name, next as PathValue<T, typeof name>, { shouldValidate: true, shouldDirty: true });
  }

  return (
    <div role="group" className={cn("flex flex-wrap gap-1.5", className)}>
      {options.map((option) => {
        const active = selected.includes(option.value);

        return (
          <button
            key={option.value}
            type="button"
            role="checkbox"
            aria-checked={active}
            onClick={() => toggle(option.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              active
                ? "border-brand bg-brand text-on-brand"
                : "border-edge bg-surface text-muted hover:border-brand/50 hover:text-brand",
            )}
          >
            {active ? <CheckIcon className="size-3.5" /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
