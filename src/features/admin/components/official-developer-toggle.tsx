"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ConfirmDialog } from "@/shared/ui";
import { setOfficialDeveloper } from "@/features/admin/api/client";

export function OfficialDeveloperToggle({
  id,
  name,
  isOfficialDeveloper,
}: {
  id: string;
  name: string;
  isOfficialDeveloper: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      await setOfficialDeveloper(id, !isOfficialDeveloper);
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        {isOfficialDeveloper ? "Quitar privilegio Ariz" : "Dar privilegio Ariz"}
      </Button>
      <ConfirmDialog
        open={open}
        title={
          isOfficialDeveloper
            ? `¿Quitarle a ${name} el privilegio de "Proyectos Ariz"?`
            : `¿Dar a ${name} el privilegio de "Proyectos Ariz"?`
        }
        description={
          isOfficialDeveloper
            ? "Sus proyectos dejarán de aparecer en la sección destacada de Proyectos Ariz del home."
            : "Sus proyectos publicados aparecerán en la sección destacada de Proyectos Ariz del home, igual que los creados desde el panel de administrador."
        }
        confirmLabel={isOfficialDeveloper ? "Quitar privilegio" : "Dar privilegio"}
        variant={isOfficialDeveloper ? "danger" : "primary"}
        loading={loading}
        onConfirm={toggle}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
