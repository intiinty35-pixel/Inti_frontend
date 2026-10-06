"use client";

import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Card, CardContent } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { AdminPageHeader } from "@/app/(panel)/panel/admin/admin-shell";
import { IncentiveImageField } from "@/features/rewards/components/incentive-image-field";
import { createIncentive } from "@/features/rewards/api/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Creando..." : "Crear incentivo"}
    </button>
  );
}

export function NewIncentiveForm() {
  async function handleCreate(formData: FormData) {
    await createIncentive(formData);
    window.location.href = ROUTES.panel.admin.incentives;
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href={ROUTES.panel.admin.incentives} className="text-sm font-bold text-brand">
        ← Volver a incentivos
      </Link>

      <AdminPageHeader
        eyebrow="Incentivos"
        title="Nuevo incentivo"
        description="Crea una nueva recompensa para el programa de referidos"
      />

      <Card>
        <CardContent className="p-6">
          <form action={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-semibold text-brand">
                Nombre *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                maxLength={200}
                className="h-10 rounded-lg border border-edge bg-surface px-3 text-sm text-ink focus:border-brand focus:outline-2 focus:outline-brand/25"
                placeholder="Ej: Gift Card S/100"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="description" className="text-sm font-semibold text-brand">
                Descripción *
              </label>
              <textarea
                id="description"
                name="description"
                required
                maxLength={1000}
                rows={3}
                className="rounded-lg border border-edge bg-surface px-3 py-2 text-sm text-ink focus:border-brand focus:outline-2 focus:outline-brand/25"
                placeholder="Describe el incentivo..."
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="promotion" className="text-sm font-semibold text-brand">
                Promoción
              </label>
              <input
                id="promotion"
                name="promotion"
                type="text"
                maxLength={500}
                className="h-10 rounded-lg border border-edge bg-surface px-3 text-sm text-ink focus:border-brand focus:outline-2 focus:outline-brand/25"
                placeholder="Ej: Canjea tus puntos por una Gift Card de S/100"
              />
            </div>

            <IncentiveImageField />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="pointsRequired" className="text-sm font-semibold text-brand">
                  Puntos requeridos *
                </label>
                <input
                  id="pointsRequired"
                  name="pointsRequired"
                  type="number"
                  required
                  min={1}
                  className="h-10 rounded-lg border border-edge bg-surface px-3 text-sm text-ink focus:border-brand focus:outline-2 focus:outline-brand/25"
                  placeholder="1000"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="stock" className="text-sm font-semibold text-brand">
                  Stock *
                </label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  required
                  min={0}
                  className="h-10 rounded-lg border border-edge bg-surface px-3 text-sm text-ink focus:border-brand focus:outline-2 focus:outline-brand/25"
                  placeholder="20"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <Link
                href={ROUTES.panel.admin.incentives}
                className="flex-1 rounded-lg border border-edge bg-surface px-4 py-2.5 text-center text-sm font-bold text-ink transition-colors hover:border-brand"
              >
                Cancelar
              </Link>
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
