"use client";

import { CheckIcon } from "@/shared/ui/icons";
import { cn } from "@/shared/lib/cn";

export type StepStatus = "done" | "current" | "todo";
export type StepperOrientation = "vertical" | "horizontal";

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
  orientation?: StepperOrientation;
  className?: string;
}

export function WizardStepper({
  steps,
  statuses,
  errorCounts,
  activeIndex,
  onSelect,
  orientation = "vertical",
  className,
}: WizardStepperProps) {
  const isHorizontal = orientation === "horizontal";

  return (
    <nav aria-label="Pasos de la creación del proyecto" className={cn("flex flex-col", className)}>
      <ol
        className={cn(
          "grid gap-2",
          isHorizontal ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" : "flex flex-col",
        )}
      >
        {steps.map((step, index) => {
          const status = statuses[index] ?? "todo";
          const errors = errorCounts[index] ?? 0;
          const isActive = index === activeIndex;
          const isDone = status === "done";
          const navigable = isActive || isDone;
          const isOnBrand = isHorizontal && isActive;

          const titleTone = isOnBrand
            ? "text-on-brand"
            : isActive && !isHorizontal
              ? "text-brand"
              : isDone
                ? "text-ink"
                : "text-muted";
          const badgeTone = isOnBrand
            ? "border-white/25 bg-white/15 text-white"
            : isActive
              ? "border-brand bg-brand text-on-brand"
              : isDone
                ? "border-brand bg-brand-soft text-brand"
                : "border-edge bg-surface text-muted";
          const subtitleTone = isOnBrand ? "text-white/75" : "text-muted";
          const issueTone = isOnBrand ? "text-white/90" : "text-error";

          return (
            <li key={step.key}>
              <button
                type="button"
                onClick={() => onSelect(index)}
                disabled={!navigable}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "flex w-full items-start gap-3 rounded-card text-left transition-colors",
                  isHorizontal ? "border px-3 py-3" : "px-2.5 py-2.5",
                  isHorizontal && isActive && "border-brand bg-brand shadow-[var(--shadow-card)]",
                  isHorizontal && !isActive && "border-edge bg-surface hover:border-brand hover:bg-brand-soft",
                  !isHorizontal && (isActive ? "bg-brand-soft" : "hover:bg-surface"),
                  navigable ? "cursor-pointer" : "cursor-default",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full border text-[11px] font-bold",
                    !isHorizontal && "mt-0.5",
                    badgeTone,
                  )}
                >
                  {isDone && !isActive ? <CheckIcon className="size-3.5" /> : index + 1}
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-sm leading-tight font-bold",
                      !isHorizontal && !isActive && "text-[13px] font-semibold",
                      titleTone,
                    )}
                  >
                    {step.title}
                  </span>
                  <span className={cn("mt-0.5 block truncate text-[11px]", subtitleTone)}>
                    {step.summary}
                  </span>
                  {isDone && errors > 0 ? (
                    <span className={cn("mt-1 block text-[10px] font-bold", issueTone)}>
                      {errors} {errors === 1 ? "campo por revisar" : "campos por revisar"}
                    </span>
                  ) : null}
                </span>
              </button>

              {!isHorizontal && index < steps.length - 1 ? (
                <span aria-hidden className="ml-[27px] block h-3 w-px bg-edge" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
