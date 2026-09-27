import { revalidatePath } from "next/cache";
import { Button, Card, CardContent } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { listProfessionals, setProfessionalStatus } from "@/features/admin/api/server";
import type { ApprovalStatus } from "@/features/auth";

const TYPE_LABELS = {
  INDEPENDENT_AGENT: "Agente independiente",
  REAL_ESTATE_AGENCY: "Inmobiliaria",
  DEVELOPER: "Desarrolladora",
} as const;

const STATUS_LABELS: Record<ApprovalStatus, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
};

const STATUS_STYLES: Record<ApprovalStatus, string> = {
  PENDING: "bg-warning/15 text-warning",
  APPROVED: "bg-success/15 text-success",
  REJECTED: "bg-error/15 text-error",
};

async function updateStatus(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (id === "" || !(status in STATUS_LABELS)) {
    return;
  }

  await setProfessionalStatus(id, status as ApprovalStatus);
  revalidatePath(ROUTES.panel.admin.base);
}

export default async function PanelAdminPage() {
  const professionals = await listProfessionals();
  const pending = professionals.filter((item) => item.status === "PENDING").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-light text-brand">Cuentas profesionales</h1>
        <p className="mt-1 text-sm text-muted">
          {pending} pendientes de validación · {professionals.length} en total
        </p>
      </div>

      {professionals.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted">
            Aún no hay cuentas profesionales registradas.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {professionals.map((item) => {
            const name = item.businessName ?? `${item.user.firstName} ${item.user.lastName ?? ""}`;

            return (
              <Card key={item.id}>
                <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-ink">{name.trim()}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLES[item.status]}`}
                      >
                        {STATUS_LABELS[item.status]}
                      </span>
                    </div>
                    <p className="text-xs text-muted">
                      {TYPE_LABELS[item.type]} · {item.ruc ? `RUC ${item.ruc}` : `DNI ${item.dni ?? "—"}`} ·{" "}
                      {item.city}
                    </p>
                    <p className="text-xs text-muted">
                      {item.user.email} · WhatsApp {item.whatsapp ?? "—"}
                    </p>
                  </div>
                  <form action={updateStatus} className="flex gap-2">
                    <input type="hidden" name="id" value={item.id} />
                    {item.status !== "APPROVED" ? (
                      <Button type="submit" name="status" value="APPROVED" size="sm">
                        Aprobar
                      </Button>
                    ) : null}
                    {item.status !== "REJECTED" ? (
                      <Button type="submit" name="status" value="REJECTED" size="sm" variant="secondary">
                        Rechazar
                      </Button>
                    ) : null}
                  </form>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
