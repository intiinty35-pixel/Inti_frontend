"use client";

import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Card, CardContent } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { AdminPageHeader } from "@/app/(panel)/panel/admin/admin-shell";
import { IncentiveImageField } from "@/features/rewards/components/incentive-image-field";
import { updateIncentive, updateIncentiveStatus, deleteIncentive } from "@/features/rewards/api/actions";

function UpdateButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 cursor-pointer rounded-lg bg-brand px-4 py-2.5 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Guardando..." : "Guardar cambios"}
    </button>
  );
}

function ToggleStatusButton({ currentStatus }: { currentStatus: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full cursor-pointer rounded-lg px-4 py-2 text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        currentStatus === "ACTIVE"
          ? "bg-surface-muted text-ink hover:bg-error/10 hover:text-error"
          : "bg-success text-white hover:bg-success/90"
      }`}
    >
      {pending ? "Actualizando..." : currentStatus === "ACTIVE" ? "Desactivar" : "Activar"}
    </button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full cursor-pointer rounded-lg border-2 border-error bg-error/10 px-4 py-2.5 text-sm font-bold text-error transition-colors hover:bg-error hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Eliminando..." : "Eliminar incentivo"}
    </button>
  );
}

interface EditIncentiveFormProps {
  id: string;
  incentive: {
    name: string;
    description: string;
    promotion?: string | null;
    imageUrl?: string | null;
    publicId?: string | null;
    pointsRequired: number;
    stock: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}

export function EditIncentiveForm({ id, incentive }: EditIncentiveFormProps) {
  async function handleUpdate(formData: FormData) {
    await updateIncentive(id, formData);
    window.location.href = ROUTES.panel.admin.incentives;
  }

  async function handleToggleStatus(formData: FormData) {
    const currentStatus = String(formData.get("currentStatus"));
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await updateIncentiveStatus(id, newStatus as "ACTIVE" | "INACTIVE");
    window.location.reload();
  }

  async function handleDelete() {
    if (!confirm("¿Estás seguro de eliminar este incentivo? Esta acción no se puede deshacer.")) {
      return;
    }
    await deleteIncentive(id);
    window.location.href = ROUTES.panel.admin.incentives;
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href={ROUTES.panel.admin.incentives} className="text-sm font-bold text-brand">
        ← Volver a incentivos
      </Link>

      <AdminPageHeader
        eyebrow="Incentivos"
        title="Editar incentivo"
        description={incentive.name}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Card>
          <CardContent className="p-6">
            <form action={handleUpdate} className="flex flex-col gap-4">
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
                  defaultValue={incentive.name}
                  className="h-10 rounded-lg border border-edge bg-surface px-3 text-sm text-ink focus:border-brand focus:outline-2 focus:outline-brand/25"
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
                  defaultValue={incentive.description}
                  className="rounded-lg border border-edge bg-surface px-3 py-2 text-sm text-ink focus:border-brand focus:outline-2 focus:outline-brand/25"
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
                  defaultValue={incentive.promotion ?? ""}
                  className="h-10 rounded-lg border border-edge bg-surface px-3 text-sm text-ink focus:border-brand focus:outline-2 focus:outline-brand/25"
                />
              </div>

              <IncentiveImageField
                initialUrl={incentive.imageUrl}
                initialPublicId={incentive.publicId}
              />

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
                    defaultValue={incentive.pointsRequired}
                    className="h-10 rounded-lg border border-edge bg-surface px-3 text-sm text-ink focus:border-brand focus:outline-2 focus:outline-brand/25"
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
                    defaultValue={incentive.stock}
                    className="h-10 rounded-lg border border-edge bg-surface px-3 text-sm text-ink focus:border-brand focus:outline-2 focus:outline-brand/25"
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
                <UpdateButton />
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="border-2 border-brand/20 bg-brand-soft/30">
            <CardContent className="p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-brand">Estado</p>
              <div className="mt-2 flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${incentive.status === "ACTIVE" ? "bg-success" : "bg-muted"}`} />
                <p className="text-lg font-bold text-ink">
                  {incentive.status === "ACTIVE" ? "Activo" : "Inactivo"}
                </p>
              </div>
              <form action={handleToggleStatus} className="mt-4">
                <input type="hidden" name="currentStatus" value={incentive.status} />
                <ToggleStatusButton currentStatus={incentive.status} />
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-brand">
                Información
              </p>
              <div className="mt-3 flex flex-col gap-3 text-sm">
                <div className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2">
                  <span className="font-semibold text-muted">Creado:</span>
                  <span className="font-bold text-ink">
                    {new Date(incentive.createdAt).toLocaleDateString("es-BO")}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2">
                  <span className="font-semibold text-muted">Actualizado:</span>
                  <span className="font-bold text-ink">
                    {new Date(incentive.updatedAt).toLocaleDateString("es-BO")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-error/30 bg-error/5">
            <CardContent className="p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-error">
                Zona peligrosa
              </p>
              <form action={handleDelete}>
                <DeleteButton />
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
