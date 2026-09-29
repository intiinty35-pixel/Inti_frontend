"use client";

import { useId, type ReactNode } from "react";
import { useFormContext, type FieldError, type FieldPath, type FieldValues } from "react-hook-form";
import { AlertIcon } from "@/shared/ui/icons";
import { cn } from "@/shared/lib/cn";

export function errorMessage(error: FieldError | undefined): string | undefined {
  const message = error?.message;
  return message ? String(message) : undefined;
}

function useFieldFeedback<T extends FieldValues>(name: FieldPath<T>) {
  const { getFieldState, formState } = useFormContext<T>();
  return errorMessage(getFieldState(name, formState).error);
}

export interface FieldShellProps {
  label: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  /** Conecta el `hint`/`error` con el control para lectores de pantalla. */
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

/** Etiqueta + asterisco de obligatorio + pista + error, compartido por todos los campos. */
export function FieldShell({
  label,
  required = false,
  hint,
  error,
  htmlFor,
  children,
  className,
}: FieldShellProps) {
  const generatedId = useId();
  const controlId = htmlFor ?? generatedId;
  const messageId = `${generatedId}-message`;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={controlId} className="text-[13px] font-semibold text-brand">
        {label}
        {required ? <span className="ml-0.5 text-error">*</span> : null}
      </label>

      {children}

      {error ? (
        <p id={messageId} role="alert" className="flex items-start gap-1.5 text-xs text-error">
          <AlertIcon className="mt-px size-3.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export interface FieldSetProps {
  legend: ReactNode;
  description?: ReactNode;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}

/** Agrupa controles relacionados (radios, chips) bajo una leyenda accesible. */
export function FieldSet({
  legend,
  description,
  required = false,
  error,
  children,
  className,
}: FieldSetProps) {
  return (
    <fieldset
      className={cn(
        "flex flex-col gap-2.5 rounded-card border border-edge bg-surface p-3.5",
        error ? "border-error" : "",
        className,
      )}
    >
      <legend className="px-1 text-[13px] font-semibold text-brand">
        {legend}
        {required ? <span className="ml-0.5 text-error">*</span> : null}
      </legend>
      {description ? <p className="text-xs text-muted">{description}</p> : null}
      {children}
      {error ? (
        <p role="alert" className="flex items-start gap-1.5 text-xs text-error">
          <AlertIcon className="mt-px size-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

/** Mensaje de error de un campo suelto (radios, chips, arrays), sin envolver el control. */
export function useFieldError<T extends FieldValues>(name: FieldPath<T>): string | undefined {
  return useFieldFeedback(name);
}
