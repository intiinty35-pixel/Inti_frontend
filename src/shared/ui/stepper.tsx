"use client";

import { CheckIcon } from "@/shared/ui/icons";
import { cn } from "@/shared/lib/cn";

export type StepStatus = "done" | "current" | "todo";

export interface WizardStepMeta {
  key: string;
  title: string;
  summary: string;
}

export interface WizardStepperProps {
  steps: readonly WizardStepMeta[];
  statuses: readonly StepStatus[];
  /** Error de validación pendiente en un paso ya visitado. */
  errorCounts: readonly number[];
  activeIndex: number;
  onSelect: (index: number) => void;
  className?: string;
}

export function WizardStepper({
  steps,
  statuses,
  errorCounts,
  activeIndex,
  onSelect,
  className,
}: WizardStepperProps) {
  return (
    <nav aria-label="Pasos de la creación del proyecto" className={cn("flex flex-col", className)}>
      <ol className="flex flex-col">
        {steps.map((step, index) => {
          const status = statuses[index] ?? "todo";
          const errors = errorCounts[index] ?? 0;
          const isActive = index === activeIndex;
          const isDone = status === "done";
          const navigable = isActive || isDone;

          return (
            <li key={step.key}>
              <button
                type="button"
                onClick={() => onSelect(index)}
                disabled={!navigable}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "flex w-full items-start gap-3 rounded-card px-2.5 py-2.5 text-left transition-colors",
                  navigable ? "cursor-pointer" : "cursor-default",
                  isActive ? "bg-brand-soft" : "hover:bg-surface",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border text-[11px] font-bold",
                    isActive
                      ? "border-brand bg-brand text-on-brand"
                      : isDone
                        ? "border-brand bg-brand-soft text-brand"
                        : "border-edge bg-surface text-muted",
                  )}
                >
                  {isDone && !isActive ? <CheckIcon className="size-3.5" /> : index + 1}
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-[13px] leading-tight font-semibold",
                      isActive ? "text-brand" : isDone ? "text-ink" : "text-muted",
                    )}
                  >
                    {step.title}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-muted">
                    {step.summary}
                  </span>
                  {isDone && errors > 0 ? (
                    <span className="mt-1 block text-[10px] font-bold text-error">
                      {errors} {errors === 1 ? "campo por revisar" : "campos por revisar"}
                    </span>
                  ) : null}
                </span>
              </button>

              {index < steps.length - 1 ? (
                <span aria-hidden className="ml-[27px] block h-3 w-px bg-edge" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
