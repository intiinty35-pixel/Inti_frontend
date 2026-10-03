import Link from "next/link";
import { BuildingIcon, Card, CardContent, Pagination, PinIcon, WhatsappIcon } from "@/shared/ui";
import { AdminPageHeader } from "@/app/(panel)/panel/admin/admin-shell";
import { listAgencies } from "@/features/admin/api/server";
import { ROUTES } from "@/shared/config/routes";

export default async function AdminAgenciesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { items, total, pageSize } = await listAgencies(page);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        eyebrow="Moderación"
        title="Inmobiliarias"
        description={`${total} inmobiliarias registradas. Revisa las publicaciones que cada una envía a la cola.`}
      />

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted">
            Aún no hay inmobiliarias registradas.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {items.map((agency) => {
            const name = (
              agency.businessName ??
              `${agency.user.firstName} ${agency.user.lastName ?? ""}`
            ).trim();
            const pendingCount = agency.properties.length + agency.projects.length;

            return (
              <Card
                key={agency.id}
                className="flex min-h-[220px] flex-col border-t-2 border-t-accent p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-hover">
                    <BuildingIcon className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-bold tracking-[0.16em] text-muted uppercase">
                      Inmobiliaria
                    </span>
                    <span className="block whitespace-normal break-words font-display text-base font-black text-brand">
                      {name}
                    </span>
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-xs">
                  <p className="flex min-w-0 items-center gap-2 text-brand">
                    <PinIcon className="size-4 shrink-0 text-accent-hover" />
                    <span className="truncate">{agency.city}</span>
                  </p>
                  <p className="break-all text-muted">{agency.user.email}</p>
                  {agency.whatsapp ? (
                    <p className="flex justify-start pt-1">
                      <span className="inline-flex max-w-full items-center gap-2 rounded-lg bg-[#25d366]/10 px-2.5 py-1.5 font-semibold text-[#168a43]">
                        <WhatsappIcon className="size-4 shrink-0" />
                        <span className="truncate">{agency.whatsapp}</span>
                      </span>
                    </p>
                  ) : null}
                </div>
                <div className="mt-auto flex flex-col gap-3 pt-4">
                  <span className="w-fit rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-bold text-brand">
                    {pendingCount} {pendingCount === 1 ? "publicación en cola" : "publicaciones en cola"}
                  </span>
                  <Link
                    href={ROUTES.panel.admin.agency(agency.id)}
                    className="flex min-h-10 items-center justify-center rounded-card bg-accent px-3 py-2 text-xs font-bold text-on-accent transition-colors hover:bg-accent-hover"
                  >
                    Revisar publicaciones
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
        buildHref={(next) => `${ROUTES.panel.admin.agencies}?page=${next}`}
      />
    </div>
  );
}
