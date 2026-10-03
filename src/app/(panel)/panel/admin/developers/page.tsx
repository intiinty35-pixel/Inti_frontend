import Link from "next/link";
import { Card, CardContent, Pagination } from "@/shared/ui";
import { AdminPageHeader } from "@/app/(panel)/panel/admin/admin-shell";
import { listDevelopers } from "@/features/admin/api/server";
import { ROUTES } from "@/shared/config/routes";

export default async function AdminDevelopersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const status = params.status === "REJECTED" ? "REJECTED" : "PENDING_REVIEW";
  const { items, total, pageSize } = await listDevelopers(status, page);
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        eyebrow="Moderación"
        title="Revisión de desarrolladoras"
        description={`${total} fichas ${status === "PENDING_REVIEW" ? "pendientes" : "rechazadas"}.`}
      />

      <div className="flex gap-2 text-sm font-bold">
        <Link
          href={ROUTES.panel.admin.developers}
          className="rounded-card bg-brand px-4 py-2 text-on-brand"
        >
          Pendientes
        </Link>
        <Link
          href={`${ROUTES.panel.admin.developers}?status=REJECTED`}
          className="rounded-card border border-edge px-4 py-2 text-brand"
        >
          Rechazadas
        </Link>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted">
            No hay desarrolladoras en esta cola.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((developer) => {
            const name = (
              developer.businessName ??
              `${developer.user.firstName} ${developer.user.lastName ?? ""}`
            ).trim();

            return (
              <Card key={developer.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-xl font-black text-brand">{name}</h2>
                    <p className="mt-1 text-sm text-muted">
                      {developer.user.email} · {developer.city}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      WhatsApp {developer.whatsapp ?? "—"}
                    </p>
                  </div>
                  <Link
                    href={`${ROUTES.panel.admin.developer(developer.id)}?status=${status}`}
                    className="rounded-card bg-brand px-3 py-2 text-xs font-bold text-on-brand"
                  >
                    Revisar
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        buildHref={(next) => `${ROUTES.panel.admin.developers}?status=${status}&page=${next}`}
      />
    </div>
  );
}
