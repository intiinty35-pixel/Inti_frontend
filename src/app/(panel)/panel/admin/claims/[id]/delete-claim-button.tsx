'use client';

import { useRef, useState, type MouseEvent } from 'react';
import { Button, ConfirmDialog, TrashIcon } from '@/shared/ui';

export function DeleteClaimButton({ claimId, confirmTitle = 'Eliminar reclamo', confirmDescription = '¿Estás seguro de que deseas eliminar este reclamo? Será removido de la lista pero permanecerá en el sistema con fines históricos.', formAction }: { claimId: string; confirmTitle?: string; confirmDescription?: string; formAction: (formData: FormData) => void }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    buttonRef.current = event.currentTarget;
    setOpen(true);
  }

  function handleConfirm() {
    setOpen(false);
    buttonRef.current?.form?.requestSubmit(buttonRef.current);
  }

  return (
    <>
      <form action={formAction} className="inline">
        <input type="hidden" name="id" value={claimId} />
        <Button type="submit" variant="secondary" size="sm" onClick={handleClick}>
          <TrashIcon className="size-4" />
          Eliminar
        </Button>
      </form>
      <ConfirmDialog
        open={open}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
