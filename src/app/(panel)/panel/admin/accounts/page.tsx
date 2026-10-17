import { revalidatePath } from "next/cache";
import Link from "next/link";
import { Card, CardContent, Pagination } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { getPublicListingsServer } from "@/features/listings/api/server";
import { getPublicProjectsServer } from "@/features/projects/api/server";
import { listProfessionals, setProfessionalStatus } from "@/features/admin/api/server";
import type { ApprovalStatus } from "@/features/auth";
import { AdminPageHeader } from "@/app/(panel)/panel/admin/admin-shell";
import { ConfirmSubmitButton } from "@/features/admin/components/confirm-submit-button";
import { OfficialDeveloperToggle } from "@/features/admin/components/official-developer-toggle";
import { AdminTestActions } from "@/app/(panel)/panel/admin/accounts/admin-test-actions";

const TYPE_LABELS = {
  INDEPENDENT_AGENT: "Agente independiente",
  REAL_ESTATE_AGENCY: "Inmobiliaria",
  DEVELOPER: "Desarrolladora",
  INDIVIDUAL_OWNER: "Usuario propietario",
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

const PUBLICATION_FILTERS = [
  { key: "all", label: "Todo", href: `${ROUTES.panel.admin.accounts}?vista=publications` },
  { key: "properties", label: "Propiedades", href: `${ROUTES.panel.admin.accounts}?vista=publications&tipo=properties` },
  { key: "projects", label: "Proyectos", href: `${ROUTES.panel.admin.accounts}?vista=publications&tipo=projects` },
] as const;

const PAGE_LIMIT = 10;

// Read only the API pages that overlap the requested range, including the
// boundary where the combined list switches from properties to projects.
async function readPublicationRange<T>(
  first: { items: T[]; total: number },
  offset: number,
  count: number,
  loadPage: (page: number) => Promise<{ items: T[] }>,
): Promise<T[]> {
  if (count <= 0 || offset >= first.total) return [];
  const firstPage = Math.floor(offset / PAGE_LIMIT) + 1;
  const lastPage = Math.floor((offset + count - 1) / PAGE_LIMIT) + 1;
  const pages = await Promise.all(
    Array.from({ length: lastPage - firstPage + 1 }, (_, i) => {
      const page = firstPage + i;
      return page === 1 ? Promise.resolve(first) : loadPage(page);
    }),
  );
  const start = offset % PAGE_LIMIT;
  return pages.flatMap((result) => result.items).slice(start, start + count);
}

async function updateStatus(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (id === "" || !(status in STATUS_LABELS)) return;

  await setProfessionalStatus(id, status as ApprovalStatus);
  revalidatePath(ROUTES.panel.admin.accounts);
}

interface AdminAccountsPageProps {
  searchParams: Promise<{ page?: string; tipo?: string; vista?: string }>;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4 text-center">
      <p className="text-2xl font-black text-ink">{value}</p>
      <p className="mt-1 text-xs font-black tracking-wide text-muted uppercase">{label}</p>
    </Card>
  );
}

export default async function AdminAccountsPage({ searchParams }: AdminAccountsPageProps) {
  const { page: pageParam, tipo, vista } = await searchParams;
  const parsedPage = Number(pageParam);
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const filter = PUBLICATION_FILTERS.some((item) => item.key === tipo) ? tipo : "all";
  const activeView = vista === "publications" || vista === "users" ? vista : null;
  const [professionalsResult, professionalPool, propertiesPage, projectsPage] =
    await Promise.all([
      listProfessionals(activeView === "publications" ? 1 : page, PAGE_LIMIT),
      listProfessionals(1, 200),
      getPublicListingsServer(PAGE_LIMIT, 1).catch(() => ({ items: [], total: 0, page: 1, pageSize: PAGE_LIMIT, hasMore: false })),
      getPublicProjectsServer(PAGE_LIMIT).catch(() => ({ items: [], total: 0, page: 1, pageSize: PAGE_LIMIT, hasMore: false })),
    ]);

  const { total, pageSize } = professionalsResult;
  const accountsPage = Math.min(page, Math.max(1, Math.ceil(total / pageSize)));
  const { items: professionals } = activeView !== "publications" && accountsPage !== page
    ? await listProfessionals(accountsPage, PAGE_LIMIT)
    : professionalsResult;
  const accountsOffset = (accountsPage - 1) * pageSize;
  const accountsRange = `${total === 0 ? 0 : accountsOffset + 1}?${Math.min(accountsOffset + professionals.length, total)} de ${total}`;

  const pending = professionals.filter((item) => item.status === "PENDING").length;
  const approved = professionalPool.items.filter((item) => item.status === "APPROVED").length;
  const agencies = professionalPool.items.filter((item) => item.type === "REAL_ESTATE_AGENCY").length;
  const agents = professionalPool.items.filter((item) => item.type === "INDEPENDENT_AGENT").length;
  const publicationTotal = (filter !== "projects" ? propertiesPage.total : 0)
    + (filter !== "properties" ? projectsPage.total : 0);
  const publicationPage = Math.min(page, Math.max(1, Math.ceil(publicationTotal / PAGE_LIMIT)));
  const offset = (publicationPage - 1) * PAGE_LIMIT;
  const propertyCount = filter === "projects" ? 0 : Math.min(PAGE_LIMIT, Math.max(0, propertiesPage.total - offset));
  const projectOffset = filter === "projects" ? offset : Math.max(0, offset - propertiesPage.total);
  const [propertyItems, projectItems] = activeView === "publications"
    ? await Promise.all([
        readPublicationRange(propertiesPage, offset, propertyCount, (p) => getPublicListingsServer(PAGE_LIMIT, p)),
        readPublicationRange(projectsPage, projectOffset, filter === "properties" ? 0 : PAGE_LIMIT - propertyCount,
          (p) => getPublicProjectsServer(PAGE_LIMIT, undefined, undefined, p)),
      ])
    : [[], []];
  const publications = [
    ...(filter !== "projects"
      ? propertyItems.map((item) => ({
          id: item.id,
          kind: "Propiedad",
          name: item.title,
          status: item.status,
          location: `${item.location.district}, ${item.location.province}`,
          date: item.publishedAt,
        }))
      : []),
    ...(filter !== "properties"
      ? projectItems.map((item) => ({
          id: item.id,
          kind: "Proyecto",
          name: item.name,
          status: item.status,
          location: `${item.location.district}, ${item.location.province}`,
          date: item.publishedAt,
        }))
      : []),
  ];
  const visibleUsers = professionals;

  return (
    <div className="flex flex-col gap-7">
      <AdminPageHeader
        align="center"
        eyebrow="Cuentas"
        title="Cuentas profesionales"
        description={`${pending} pendientes de validacion en esta pagina · ${total} en total`}
      />

      <div className="grid gap-3 md:grid-cols-4">
        <StatBox label="Pendientes" value={pending} />
        <StatBox label="Aprobadas" value={approved} />
        <StatBox label="Inmobiliarias" value={agencies} />
        <StatBox label="Agentes" value={agents} />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Link
          href={ROUTES.panel.admin.accounts}
          className={`rounded-card border p-5 transition-colors ${
            !activeView ? "border-brand bg-brand text-on-brand" : "border-edge bg-surface text-ink hover:border-brand"
          }`}
        >
          <p className="text-xs font-black tracking-wide uppercase opacity-75">Cuentas</p>
          <p className="mt-1 text-xl font-black">Cuentas profesionales</p>
          <p className="mt-2 text-sm opacity-80">{pending} pendientes de validacion en esta pagina · {total} en total.</p>
        </Link>
        <Link
          href={`${ROUTES.panel.admin.accounts}?vista=publications`}
          className={`rounded-card border p-5 transition-colors ${
            activeView === "publications" ? "border-brand bg-brand text-on-brand" : "border-edge bg-surface text-ink hover:border-brand"
          }`}
        >
          <p className="text-xs font-black tracking-wide uppercase opacity-75">Control</p>
          <p className="mt-1 text-xl font-black">Publicaciones del sistema</p>
          <p className="mt-2 text-sm opacity-80">Vista tipo tabla para revisar propiedades y proyectos publicados.</p>
        </Link>
        <Link
          href={`${ROUTES.panel.admin.accounts}?vista=users`}
          className={`rounded-card border p-5 transition-colors ${
            activeView === "users" ? "border-brand bg-brand text-on-brand" : "border-edge bg-surface text-ink hover:border-brand"
          }`}
        >
          <p className="text-xs font-black tracking-wide uppercase opacity-75">Usuarios</p>
          <p className="mt-1 text-xl font-black">Usuarios registrados</p>
          <p className="mt-2 text-sm opacity-80">Listado administrativo con datos disponibles de las cuentas registradas.</p>
        </Link>
      </div>

      {!activeView ? (
      <>
      {professionals.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted">
            Aun no hay cuentas profesionales registradas.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1680px] table-fixed border-collapse text-sm">
                <colgroup>
                  <col className="w-[18%]" />
                  <col className="w-[9%]" />
                  <col className="w-[9%]" />
                  <col className="w-[18%]" />
                  <col className="w-[10%]" />
                  <col className="w-[16%]" />
                  <col className="w-[20%]" />
                </colgroup>
                <thead className="bg-surface-muted text-left text-[11px] font-black tracking-wide text-muted uppercase">
                  <tr>
                    <th className="border-b border-edge px-4 py-3">Cuenta</th>
                    <th className="border-b border-edge px-4 py-3">Perfil</th>
                    <th className="border-b border-edge px-4 py-3">Documento</th>
                    <th className="border-b border-edge px-4 py-3">Contacto</th>
                    <th className="border-b border-edge px-4 py-3">Estado</th>
                    <th className="border-b border-edge px-4 py-3">Validacion</th>
                    <th className="border-b border-edge px-4 py-3">Prueba</th>
                  </tr>
                </thead>
                <tbody>
                  {professionals.map((item) => {
                    const name = (item.businessName ?? `${item.user.firstName} ${item.user.lastName ?? ""}`).trim();
                    const initial = name.charAt(0).toUpperCase() || "A";

                    return (
                      <tr key={item.id} className="hover:bg-surface-muted/60">
                        <td className="border-b border-edge px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-black text-on-brand">
                              {initial}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-black text-ink">{name}</p>
                              <p className="truncate text-xs text-muted">{item.city}</p>
                            </div>
                          </div>
                        </td>
                        <td className="border-b border-edge px-4 py-3 text-muted">
                          <span className="block max-w-[120px]">{TYPE_LABELS[item.type]}</span>
                        </td>
                        <td className="border-b border-edge px-4 py-3 text-muted">{item.ruc ? `RUC ${item.ruc}` : `DNI ${item.dni ?? "-"}`}</td>
                        <td className="border-b border-edge px-4 py-3">
                          <p className="break-all font-semibold text-ink">{item.user.email}</p>
                          <p className="text-xs text-muted">WhatsApp {item.whatsapp ?? "-"}</p>
                        </td>
                        <td className="border-b border-edge px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLES[item.status]}`}>
                              {STATUS_LABELS[item.status]}
                            </span>
                            {item.isOfficialDeveloper ? (
                              <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-bold text-accent">
                                PROYECTOS ARIZ
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="border-b border-edge px-4 py-3">
                          <div className="flex min-w-max items-center gap-3 whitespace-nowrap">
                            <form action={updateStatus} className="flex min-w-max items-center gap-3 whitespace-nowrap">
                              <input type="hidden" name="id" value={item.id} />
                              {item.status !== "APPROVED" ? (
                                <ConfirmSubmitButton name="status" value="APPROVED" size="xs" className="px-3 whitespace-nowrap" confirmTitle={`Aprobar la cuenta de ${name}?`} confirmLabel="Aprobar">
                                  Aprobar
                                </ConfirmSubmitButton>
                              ) : null}
                              {item.status !== "REJECTED" ? (
                                <ConfirmSubmitButton name="status" value="REJECTED" size="xs" variant="secondary" className="px-3 whitespace-nowrap" confirmTitle={`Rechazar la cuenta de ${name}?`} confirmLabel="Rechazar">
                                  Rechazar
                                </ConfirmSubmitButton>
                              ) : null}
                            </form>
                            {item.status === "APPROVED" ? (
                              <OfficialDeveloperToggle id={item.id} name={name} isOfficialDeveloper={item.isOfficialDeveloper} />
                            ) : null}
                          </div>
                        </td>
                        <td className="border-b border-edge px-4 py-3">
                          <AdminTestActions
                            label={name}
                            notifyId={item.id}
                            deleteTarget={{ kind: "account", id: item.id }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          <p className="text-center text-xs text-muted">{accountsRange} cuentas</p>
          <Pagination page={accountsPage} pageSize={pageSize} total={total} buildHref={(p) => `${ROUTES.panel.admin.accounts}?page=${p}`} />
        </>
      )}
      </>
      ) : null}

      {activeView === "publications" ? (
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <AdminPageHeader
            eyebrow="Control"
            title="Publicaciones del sistema"
            description="Vista tipo tabla para revisar propiedades y proyectos publicados."
          />
          <div className="flex flex-wrap gap-2">
            {PUBLICATION_FILTERS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`inline-flex h-9 items-center rounded-card border px-3 text-xs font-black ${
                  filter === item.key ? "border-brand bg-brand text-on-brand" : "border-edge bg-surface text-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] table-fixed border-collapse text-sm">
              <colgroup>
                <col className="w-[10%]" />
                <col className="w-[29%]" />
                <col className="w-[17%]" />
                <col className="w-[12%]" />
                <col className="w-[13%]" />
                <col className="w-[19%]" />
              </colgroup>
              <thead className="bg-surface-muted text-left text-[11px] font-black tracking-wide text-muted uppercase">
                <tr>
                  <th className="border-b border-edge px-4 py-3">Tipo</th>
                  <th className="border-b border-edge px-4 py-3">Publicacion</th>
                  <th className="border-b border-edge px-4 py-3">Ubicacion</th>
                  <th className="border-b border-edge px-4 py-3">Estado</th>
                  <th className="border-b border-edge px-4 py-3">Fecha</th>
                  <th className="border-b border-edge px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {publications.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-muted">No hay publicaciones para este filtro.</td></tr>
                ) : null}
                {publications.map((item) => (
                  <tr key={`${item.kind}-${item.id}`} className="hover:bg-surface-muted/60">
                    <td className="border-b border-edge px-4 py-3 font-bold text-brand">{item.kind}</td>
                    <td className="border-b border-edge px-4 py-3 font-semibold text-ink">{item.name}</td>
                    <td className="border-b border-edge px-4 py-3 text-muted">{item.location}</td>
                    <td className="border-b border-edge px-4 py-3 text-muted">{item.status}</td>
                    <td className="border-b border-edge px-4 py-3 text-muted">{formatDate(item.date)}</td>
                    <td className="border-b border-edge px-4 py-3">
                      <AdminTestActions
                        label={item.name}
                        deleteTarget={{ kind: item.kind === "Propiedad" ? "property" : "project", id: item.id }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="text-center text-xs text-muted">
          {publicationTotal === 0 ? 0 : offset + 1}?{Math.min(offset + publications.length, publicationTotal)} de {publicationTotal} publicaciones
        </p>
        <Pagination
          page={publicationPage}
          pageSize={PAGE_LIMIT}
          total={publicationTotal}
          buildHref={(p) => `${ROUTES.panel.admin.accounts}?vista=publications${filter === "all" ? "" : `&tipo=${filter}`}&page=${p}`}
        />
      </section>
      ) : null}

      {activeView === "users" ? (
      <section className="flex flex-col gap-4">
        <AdminPageHeader
          eyebrow="Usuarios"
          title="Usuarios registrados"
          description="Listado administrativo con datos disponibles de las cuentas registradas."
        />
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] table-fixed border-collapse text-sm">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[23%]" />
                <col className="w-[14%]" />
                <col className="w-[13%]" />
                <col className="w-[9%]" />
                <col className="w-[19%]" />
              </colgroup>
              <thead className="bg-surface-muted text-left text-[11px] font-black tracking-wide text-muted uppercase">
                <tr>
                  <th className="border-b border-edge px-4 py-3">Usuario</th>
                  <th className="border-b border-edge px-4 py-3">Correo</th>
                  <th className="border-b border-edge px-4 py-3">Documento</th>
                  <th className="border-b border-edge px-4 py-3">Telefono</th>
                  <th className="border-b border-edge px-4 py-3">Ciudad</th>
                  <th className="border-b border-edge px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-muted">No hay usuarios registrados.</td></tr>
                ) : null}
                {visibleUsers.map((item) => {
                  const name = `${item.user.firstName} ${item.user.lastName ?? ""}`.trim() || item.businessName || "Usuario";
                  return (
                    <tr key={item.user.id} className="hover:bg-surface-muted/60">
                      <td className="border-b border-edge px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-lg bg-brand text-xs font-black text-on-brand">
                            {name.charAt(0).toUpperCase()}
                          </span>
                          <span className="font-semibold text-ink">{name}</span>
                        </div>
                      </td>
                      <td className="break-all border-b border-edge px-4 py-3 text-muted">{item.user.email}</td>
                      <td className="border-b border-edge px-4 py-3 text-muted">{item.ruc ? `RUC ${item.ruc}` : `DNI ${item.dni ?? "-"}`}</td>
                      <td className="border-b border-edge px-4 py-3 text-muted">{item.user.phone ?? item.whatsapp ?? "-"}</td>
                      <td className="border-b border-edge px-4 py-3 text-muted">{item.city}</td>
                      <td className="border-b border-edge px-4 py-3">
                        <AdminTestActions
                          label={name}
                          notifyId={item.id}
                          deleteTarget={{ kind: "account", id: item.id }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="text-center text-xs text-muted">{accountsRange} usuarios</p>
        <Pagination
          page={accountsPage}
          pageSize={pageSize}
          total={total}
          buildHref={(p) => `${ROUTES.panel.admin.accounts}?vista=users&page=${p}`}
        />
      </section>
      ) : null}
    </div>
  );
}
