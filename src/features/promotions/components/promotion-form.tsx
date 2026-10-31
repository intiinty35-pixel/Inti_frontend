"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, PlusIcon, XIcon } from "@/shared/ui";
import { IncentiveImageField } from "@/features/rewards/components/incentive-image-field";
import { createPromotion, updatePromotion } from "@/features/promotions/api/actions";
import type { AdminPromotion } from "@/features/promotions/types";

function boliviaDay(date: Date) {
  return date.toLocaleDateString("en-CA", { timeZone: "America/La_Paz" });
}

/** Modal para crear una promoción o, si recibe `promotion`, editarla. */
export function PromotionFormModal({
  promotion,
  onClose,
}: {
  promotion?: AdminPromotion;
  onClose: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const editing = Boolean(promotion);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    setLoading(true);

    try {
      if (promotion) await updatePromotion(promotion.id, form);
      else await createPromotion(form);
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/50 p-4">
      <div className="flex min-h-full items-center justify-center">
        <div className="max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-card border border-edge bg-surface p-6 shadow-[var(--shadow-pop)]">
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-ink">{editing ? "Editar promoción" : "Nueva promoción"}</p>
            <button
              type="button"
              aria-label="Cerrar"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full border border-edge text-muted transition-colors hover:bg-surface-muted"
            >
              <XIcon className="size-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
            <Input
              name="title"
              label="Título (solo para identificarla en el panel)"
              placeholder="Ej: Feria de lotes octubre"
              defaultValue={promotion?.title}
              maxLength={200}
              required
            />

            <IncentiveImageField
              folder="ariz/promotions"
              allowUrl={false}
              initialUrl={promotion?.imageUrl}
              initialPublicId={promotion?.publicId}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                name="startDate"
                type="date"
                label="Se muestra desde"
                defaultValue={boliviaDay(promotion ? new Date(promotion.startsAt) : new Date())}
                required
              />
              <Input
                name="endDate"
                type="date"
                label="Hasta (inclusive)"
                defaultValue={promotion ? boliviaDay(new Date(promotion.endsAt)) : undefined}
                required
              />
            </div>

            {error ? <p className="text-sm text-error">{error}</p> : null}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : editing ? "Guardar cambios" : "Crear promoción"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function PromotionForm() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)} className="gap-2 self-start">
        <PlusIcon className="size-4" />
        Nueva promoción
      </Button>
      {open ? <PromotionFormModal onClose={() => setOpen(false)} /> : null}
    </>
  );
}
