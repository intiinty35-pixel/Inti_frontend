"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";

export function DeleteReferrerButton({
  action,
  disabled,
}: {
  action: () => Promise<void>;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={disabled || pending}
      onClick={() => {
        if (!confirm("¿Eliminar este miembro de la lista? Su historial de referidos y puntos se conserva.")) return;
        startTransition(() => {
          void action();
        });
      }}
      className="border-error/30 text-error hover:border-error hover:bg-error/10"
    >
      <Trash2 className="size-4" />
      {pending ? "Eliminando..." : "Eliminar miembro"}
    </Button>
  );
}
