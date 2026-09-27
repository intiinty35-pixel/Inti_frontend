import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brand text-on-brand hover:bg-brand-hover shadow-[var(--shadow-card)]",
  secondary: "bg-surface text-ink border border-edge hover:border-brand",
  ghost: "bg-transparent text-muted hover:text-ink hover:bg-surface-muted",
  danger: "bg-error text-white hover:opacity-90",
};

const SIZES: Record<ButtonSize, string> = {
  xs: "h-7 px-2.5 text-xs rounded-card",
  sm: "h-8 px-3 text-sm rounded-card",
  md: "h-10 px-4 text-sm rounded-card",
  lg: "h-12 px-6 text-base rounded-card",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}

export interface SoonButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

/**
 * Botón visual para acciones que todavía no tienen destino.
 * Sigue el patrón "Disponible próximamente" ya usado en el nav y el chatbot.
 */
export function SoonButton({
  variant = "primary",
  size = "sm",
  className,
  children,
  ...props
}: SoonButtonProps) {
  return (
    <button
      type="button"
      disabled
      aria-disabled
      title="Disponible próximamente"
      className={cn(
        "inline-flex cursor-not-allowed items-center justify-center gap-2 font-medium select-none disabled:opacity-55",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}