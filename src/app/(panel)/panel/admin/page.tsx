import { revalidatePath } from "next/cache";
import { Card, CardContent, Pagination } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { listProfessionals, setProfessionalStatus } from "@/features/admin/api/server";
import type { ApprovalStatus } from "@/features/auth";
import { AdminPageHeader } from "@/app/(panel)/panel/admin/admin-shell";
import { ConfirmSubmitButton } from "@/features/admin/components/confirm-submit-button";
import { OfficialDeveloperToggle } from "@/features/admin/components/official-developer-toggle";

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

interface PanelAdminPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function PanelAdminPage({ searchParams }: PanelAdminPageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { items: professionals, total, pageSize } = await listProfessionals(page);
  const pending = professionals.filter((item) => item.status === "PENDING").length;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        eyebrow="Cuentas"
        title="Cuentas profesionales"
        description={`${pending} pendientes de validación en esta página · ${total} en total`}
      />

      {professionals.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted">
            Aún no hay cuentas profesionales registradas.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid min-w-0 gap-4 lg:grid-cols-2">
            {professionals.map((item) => {
              const name = (item.businessName ?? `${item.user.firstName} ${item.user.lastName ?? ""}`).trim();
              const initial = name.charAt(0).toUpperCase() || "A";

              return (
                <Card key={item.id} className="min-w-0 p-3 sm:p-5">
                  <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand text-lg font-black text-on-brand">
                      {initial}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="min-w-0 break-words text-base font-bold text-ink [overflow-wrap:anywhere]">
                          {name}
                        </p>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLES[item.status]}`}
                        >
                          {STATUS_LABELS[item.status]}
                        </span>
                        {item.isOfficialDeveloper ? (
                          <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-bold text-accent">
                            PROYECTOS ARIZ
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-muted">
                        {TYPE_LABELS[item.type]} · {item.ruc ? `RUC ${item.ruc}` : `DNI ${item.dni ?? "—"}`} ·{" "}
                        {item.city}
                      </p>
                      <p className="break-words text-sm text-muted [overflow-wrap:anywhere]">
                        {item.user.email} · WhatsApp {item.whatsapp ?? "—"}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <form action={updateStatus} className="flex gap-2">
                          <input type="hidden" name="id" value={item.id} />
                          {item.status !== "APPROVED" ? (
                            <ConfirmSubmitButton
                              name="status"
                              value="APPROVED"
                              size="sm"
                              confirmTitle={`¿Aprobar la cuenta de ${name}?`}
                              confirmLabel="Aprobar"
                            >
                              Aprobar
                            </ConfirmSubmitButton>
                          ) : null}
                          {item.status !== "REJECTED" ? (
                            <ConfirmSubmitButton
                              name="status"
                              value="REJECTED"
                              size="sm"
                              variant="secondary"
                              confirmTitle={`¿Rechazar la cuenta de ${name}?`}
                              confirmLabel="Rechazar"
                            >
                              Rechazar
                            </ConfirmSubmitButton>
                          ) : null}
                        </form>
                        {item.status === "APPROVED" ? (
                          <OfficialDeveloperToggle
                            id={item.id}
                            name={name}
                            isOfficialDeveloper={item.isOfficialDeveloper}
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            buildHref={(p) => `${ROUTES.panel.admin.base}?page=${p}`}
          />
        </>
      )}
    </div>
  );
}
