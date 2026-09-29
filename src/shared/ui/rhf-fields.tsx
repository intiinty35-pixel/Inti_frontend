"use client";

import { useFormContext, useWatch, type FieldPath, type FieldPathValue, type FieldValues } from "react-hook-form";
import { FieldShell, useFieldError } from "@/shared/ui/field-shell";
import { Input, type InputProps } from "@/shared/ui/input";
import { Listbox, type ListboxOption } from "@/shared/ui/listbox";
import { Textarea, type TextareaProps } from "@/shared/ui/textarea";
import { cn } from "@/shared/lib/cn";

type NativeInputProps = Omit<InputProps, "name" | "label" | "hint" | "error">;

export interface TextFieldProps<T extends FieldValues> extends NativeInputProps {
  name: FieldPath<T>;
  label: string;
  required?: boolean;
  hint?: string;
  /** Si se omite, el error se lee de la ruta `name`. */
  error?: string;
}

/**
 * `Input` enlazado a react-hook-form: la etiqueta, el asterisco de obligatorio,
 * la pista y el error salen de la ruta `name`, sin repetir marcado en cada paso.
 */
export function TextField<T extends FieldValues>({
  name,
  label,
  required = false,
  hint,
  error: providedError,
  ...inputProps
}: TextFieldProps<T>) {
  const { register } = useFormContext<T>();
  const fieldError = useFieldError(name);
  const error = providedError ?? fieldError;

  return (
    <FieldShell label={label} required={required} hint={hint} error={error} htmlFor={name}>
      <Input id={name} {...register(name)} error={error} {...inputProps} />
    </FieldShell>
  );
}

export interface SelectFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  options: readonly ListboxOption[];
  required?: boolean;
  hint?: string;
  /** Si se omite, el error se lee de la ruta `name`. */
  error?: string;
  className?: string;
  triggerClassName?: string;
}

/**
 * Desplegable enlazado a react-hook-form. Usa el `Listbox` de marca en vez de un
 * `<select>` nativo para que el popup herede la paleta y el radio del portal.
 */
export function SelectField<T extends FieldValues>({
  name,
  label,
  options,
  required = false,
  hint,
  error: providedError,
  className,
  triggerClassName,
}: SelectFieldProps<T>) {
  const { setValue } = useFormContext<T>();
  const fieldError = useFieldError(name);
  const error = providedError ?? fieldError;
  const selected = useWatch({ name }) as string | undefined;

  return (
    <FieldShell
      label={label}
      required={required}
      hint={hint}
      error={error}
      htmlFor={name}
      className={className}
    >
      <Listbox
        name={name}
        id={name}
        value={selected ?? ""}
        options={options}
        onValueChange={(value) =>
          setValue(name, value as FieldPathValue<T, typeof name>, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
        label={label}
        triggerClassName={cn(
          "h-11 rounded-card border border-edge bg-surface px-3.5 hover:border-brand/50",
          triggerClassName,
        )}
      />
    </FieldShell>
  );
}

export interface TextAreaFieldProps<T extends FieldValues>
  extends Omit<TextareaProps, "name" | "label" | "hint" | "error"> {
  name: FieldPath<T>;
  label: string;
  required?: boolean;
  hint?: string;
  /** Si se omite, el error se lee de la ruta `name`. */
  error?: string;
}

export function TextAreaField<T extends FieldValues>({
  name,
  label,
  required = false,
  hint,
  error: providedError,
  ...textareaProps
}: TextAreaFieldProps<T>) {
  const { register } = useFormContext<T>();
  const fieldError = useFieldError(name);
  const error = providedError ?? fieldError;

  return (
    <FieldShell label={label} required={required} hint={hint} error={error} htmlFor={name}>
      <Textarea id={name} {...register(name)} error={error} {...textareaProps} />
    </FieldShell>
  );
}

export interface NumericFieldProps<T extends FieldValues>
  extends Omit<InputProps, "name" | "label" | "hint" | "error" | "type" | "step"> {
  name: FieldPath<T>;
  label: string;
  required?: boolean;
  hint?: string;
  /** Si se omite, el error se lee de la ruta `name`. */
  error?: string;
  /** Texto fijo a la izquierda del input, p. ej. "S/" o "m²". */
  prefix?: string;
  /**
   * `1` fuerza enteros y `any` (o cualquier otro valor) decimales. Solo decide el
   * teclado del móvil: el input es de texto para que el navegador no rechace lo
   * que se escribe a medio número.
   */
  step?: number | "any";
}

export function toNumberOrUndefined(value: unknown): number | undefined {
  if (typeof value !== "string" && typeof value !== "number") {
    return undefined;
  }

  const text = String(value).trim();

  if (text === "") {
    return undefined;
  }

  // Acepta coma decimal y espacios de miles: "68 000,50" se guarda como 68000.5.
  return Number(text.replace(/[\s\u00a0]/g, "").replace(",", "."));
}

/**
 * Deja pasar solo dígitos, un posible signo inicial y un separador decimal, para
 * que el input no acepte letras. El separador que se conserva es el primero.
 */
export function sanitizeNumericInput(value: string): string {
  const negative = value.trimStart().startsWith("-");
  const cleaned = value.replace(/[^\d.,]/g, "");
  const separatorAt = cleaned.search(/[.,]/);
  const sign = negative ? "-" : "";

  if (separatorAt === -1) {
    return `${sign}${cleaned}`;
  }

  return `${sign}${cleaned.slice(0, separatorAt)}${cleaned[separatorAt]}${cleaned
    .slice(separatorAt + 1)
    .replace(/[.,]/g, "")}`;
}

/**
 * Campo numérico enlazado a react-hook-form. `setValueAs` convierte el texto del
 * input a `number | undefined` antes de que lo vea el resolver, para que el
 * tipo de entrada del schema zod coincida con `ProjectDraft`.
 */
export function NumericField<T extends FieldValues>({
  name,
  label,
  required = false,
  hint,
  prefix,
  step,
  className,
  error: providedError,
  ...inputProps
}: NumericFieldProps<T>) {
  const { register } = useFormContext<T>();
  const fieldError = useFieldError(name);
  const error = providedError ?? fieldError;
  const { onChange, ...field } = register(name, { setValueAs: toNumberOrUndefined });

  return (
    <FieldShell label={label} required={required} hint={hint} error={error} htmlFor={name}>
      <Input
        id={name}
        type="text"
        inputMode={step === 1 ? "numeric" : "decimal"}
        autoComplete="off"
        {...field}
        onChange={(event) => {
          const cleaned = sanitizeNumericInput(event.target.value);

          if (cleaned !== event.target.value) {
            event.target.value = cleaned;
          }

          onChange(event);
        }}
        error={error}
        leading={prefix}
        className={className}
        {...inputProps}
      />
    </FieldShell>
  );
}
