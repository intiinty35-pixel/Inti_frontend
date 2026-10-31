import { Mail, MessageSquareText, Phone, UserRound } from "lucide-react";
import { Card, CardContent, Pagination } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { revalidatePath } from "next/cache";
import { ConfirmSubmitButton } from "@/features/admin/components/confirm-submit-button";
import { deleteContactReport, listContactReports } from "@/features/admin/api/server";

async function removeReport(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteContactReport(id);
  revalidatePath(ROUTES.panel.admin.reports);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const parsedPage = Number(pageParam);
  const requestedPage = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  let data = await listContactReports(requestedPage, 10);
  const page = Math.min(requestedPage, Math.max(1, Math.ceil(data.total / 10)));
  if (page !== requestedPage) data = await listContactReports(page, 10);

  return (
    <div className="flex min-w-0 max-w-full flex-col gap-7 overflow-x-hidden">
      <section className="relative overflow-hidden rounded-card border border-edge bg-surface p-5 text-center shadow-[var(--shadow-card)] sm:p-6">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-brand" aria-hidden="true" />
        <p className="text-sm font-black uppercase tracking-[0.22em] text-accent">
          Contacto
        </p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-brand sm:text-5xl">
          Reportes
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-muted sm:text-base">
          Consultas enviadas desde la pagina de contacto. Cada envio queda registrado y
          tambien se notifica por Brevo al correo configurado.
        </p>
      </section>

      {data.items.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <MessageSquareText className="size-7" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-black text-brand">
              Aun no hay reportes
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted">
              Cuando un cliente envie el formulario de contacto, aparecera aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <section className="grid min-w-0 max-w-full gap-4 lg:grid-cols-2">
          {data.items.map((report) => (
            <Card key={report.id} className="min-w-0 overflow-hidden">
              <div className="h-1.5 bg-brand" aria-hidden="true" />
              <CardContent className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-accent">
                      {report.topic}
                    </p>
                    <h2 className="mt-1 line-clamp-2 font-display text-2xl font-black text-brand">
                      {report.name}
                    </h2>
                  </div>
                  <span className="shrink-0 rounded-full bg-brand-soft px-3 py-1 text-xs font-black text-brand">
                    {formatDate(report.createdAt)}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-muted">
                  <p className="flex min-w-0 items-center gap-2">
                    <Mail className="size-4 shrink-0 text-accent" aria-hidden="true" />
                    <span className="truncate">{report.email}</span>
                  </p>
                  {report.phone ? (
                    <p className="flex min-w-0 items-center gap-2">
                      <Phone className="size-4 shrink-0 text-accent" aria-hidden="true" />
                      <span className="truncate">{report.phone}</span>
                    </p>
                  ) : null}
                  <p className="flex min-w-0 items-center gap-2">
                    <UserRound className="size-4 shrink-0 text-accent" aria-hidden="true" />
                    <span className="truncate">Estado: {report.status}</span>
                  </p>
                </div>

                <p className="mt-4 whitespace-pre-line rounded-card bg-canvas p-4 text-sm font-medium leading-6 text-ink">
                  {report.message}
                </p>
                <form action={removeReport} className="mt-4 flex justify-end">
                  <input type="hidden" name="id" value={report.id} />
                  <ConfirmSubmitButton
                    variant="secondary"
                    size="xs"
                    confirmTitle="?Eliminar este reporte?"
                    confirmDescription="Se ocultar? del listado y se conservar? en el historial del sistema."
                    confirmLabel="Eliminar"
                  >
                    Eliminar
                  </ConfirmSubmitButton>
                </form>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      <p className="text-center text-xs text-muted">
        {data.total === 0 ? 0 : (page - 1) * 10 + 1}?{Math.min((page - 1) * 10 + data.items.length, data.total)} de {data.total} reportes
      </p>
      <Pagination
        page={page}
        pageSize={data.pageSize}
        total={data.total}
        buildHref={(p) => `${ROUTES.panel.admin.reports}?page=${p}`}
      />
    </div>
  );
}
