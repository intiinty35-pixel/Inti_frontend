"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/shared/ui";
import { deletePromotion, setPromotionActive } from "@/features/promotions/api/actions";
import { PromotionFormModal } from "@/features/promotions/components/promotion-form";
import type { AdminPromotion } from "@/features/promotions/types";

export function PromotionRowActions({ promotion }: { promotion: AdminPromotion }) {
  const { id, isActive } = promotion;
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      await deletePromotion(id);
      setConfirmOpen(false);
    });
  }

  return (
    <>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => setEditOpen(true)}
          className="rounded-lg border border-edge bg-surface px-3 py-1.5 text-xs font-bold text-ink transition-colors hover:border-brand disabled:opacity-50"
        >
          Editar
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => setPromotionActive(id, !isActive))}
          className="rounded-lg border border-edge bg-surface px-3 py-1.5 text-xs font-bold text-ink transition-colors hover:border-brand disabled:opacity-50"
        >
          {isActive ? "Desactivar" : "Activar"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setConfirmOpen(true)}
          className="flex size-8 items-center justify-center rounded-lg text-error transition-colors hover:bg-error hover:text-white disabled:opacity-50"
          aria-label="Eliminar promoción"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {editOpen ? <PromotionFormModal promotion={promotion} onClose={() => setEditOpen(false)} /> : null}

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar promoción"
        description="¿Estás seguro de que deseas eliminar esta promoción? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="danger"
        loading={pending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
