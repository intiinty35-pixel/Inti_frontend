"use client";

import { useRef, useState, type MouseEvent } from "react";
import { Button, ConfirmDialog, type ButtonProps } from "@/shared/ui";

export interface ConfirmSubmitButtonProps extends Omit<ButtonProps, "type"> {
  confirmTitle: string;
  confirmDescription?: string;
  confirmLabel?: string;
}

/** Boton de submit (dentro de un form con server action) que pide confirmacion antes de disparar la accion. */
export function ConfirmSubmitButton({
  confirmTitle,
  confirmDescription,
  confirmLabel,
  onClick,
  variant,
  ...props
}: ConfirmSubmitButtonProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    buttonRef.current = event.currentTarget;
    setOpen(true);
    onClick?.(event);
  }

  function handleConfirm() {
    setOpen(false);
    buttonRef.current?.form?.requestSubmit(buttonRef.current);
  }

  return (
    <>
      <Button type="button" variant={variant} onClick={handleClick} {...props} />
      <ConfirmDialog
        open={open}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel={confirmLabel}
        variant={variant === "secondary" ? "danger" : "primary"}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
