import Link from "next/link";
import { revalidatePath } from "next/cache";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  Mail,
  MapPin,
  MessageCircle,
  PanelsTopLeft,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/shared/ui";
import type {
  AdminAgencyProjectReview,
  AdminAgencyPropertyReview,
} from "@/features/admin/api/server";
import { AgencyPublicationDetails } from "@/features/admin/components/agency-publication-details";
import {
  getAgency,
  publishAgencyProject,
  publishAgencyProperty,
  rejectAgencyProject,
  rejectAgencyProperty,
} from "@/features/admin/api/server";
import { ROUTES } from "@/shared/config/routes";

async function reviewAgencyPublication(formData: FormData) {
  "use server";

  const itemId = String(formData.get("itemId") ?? "");
  const agencyId = String(formData.get("agencyId") ?? "");
  const kind = String(formData.get("kind") ?? "");
  const action = String(formData.get("action") ?? "");

  if (
    !itemId ||
    !agencyId ||
    !["property", "project"].includes(kind) ||
    !["publish", "reject"].includes(action)
  ) {
    throw new Error("La solicitud de revisión no es válida.");
  }

  if (kind === "property") {
    await (action === "publish"
      ? publishAgencyProperty(itemId)
      : rejectAgencyProperty(itemId));
  } else {
    await (action === "publish"
      ? publishAgencyProject(itemId)
      : rejectAgencyProject(itemId));
  }

  revalidatePath(ROUTES.panel.admin.agencies);
  revalidatePath(ROUTES.panel.admin.agency(agencyId));
  revalidatePath("/");
  revalidatePath(ROUTES.properties);
  revalidatePath(ROUTES.projects);
}

export default async function AdminAgencyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tipo?: string }>;
}) {
  const [{ id }, { tipo }] = await Promise.all([params, searchParams]);
  const selectedQueue = tipo === "proyectos" ? "project" : "property";
  const agency = await getAgency(id);
  const name = (
    agency.businessName ??
    `${agency.user.firstName} ${agency.user.lastName ?? ""}`
  ).trim();
  const propertyCount = agency.properties.length;
  const projectCount = agency.projects.length;
  const totalCount = propertyCount + projectCount;

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={ROUTES.panel.admin.agencies}
          className="inline-flex min-h-10 w-fit items-center gap-2 rounded-card border border-edge bg-surface px-3.5 py-2 text-sm font-bold text-brand transition-colors hover:border-brand hover:bg-brand-soft"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver a inmobiliarias
        </Link>
        <span className="w-fit rounded-full bg-warning/15 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-warning">
          Cola de revisión
        </span>
      </div>

      <section className="relative overflow-hidden rounded-card border border-edge bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-brand" aria-hidden="true" />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-center">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-accent">
              Inmobiliaria
            </p>
            <h1 className="mt-2 break-words font-display text-3xl font-black tracking-tight text-brand sm:text-4xl">
              {name}
            </h1>
            <div className="mt-4 grid gap-2 text-sm text-muted sm:grid-cols-3">
              <p className="flex min-w-0 items-center gap-2">
                <MapPin className="size-4 shrink-0 text-accent" aria-hidden="true" />
                <span className="truncate">{agency.city || "Ciudad no registrada"}</span>
              </p>
              <p className="flex min-w-0 items-center gap-2">
                <Mail className="size-4 shrink-0 text-accent" aria-hidden="true" />
                <span className="truncate">{agency.user.email}</span>
              </p>
              <p className="flex min-w-0 items-center gap-2">
                <MessageCircle className="size-4 shrink-0 text-success" aria-hidden="true" />
                <span className="truncate">{agency.whatsapp ?? "WhatsApp no registrado"}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-card border border-brand/15 bg-brand-soft p-4">
            <Metric label="Total" value={totalCount} Icon={ClipboardList} />
            <Metric label="Props." value={propertyCount} Icon={PanelsTopLeft} />
            <Metric label="Proy." value={projectCount} Icon={FolderKanban} />
          </div>
        </div>
      </section>

      <div className="flex w-fit max-w-full gap-2 overflow-x-auto rounded-card bg-surface-muted/70 p-1.5">
        <QueueTab
          href={`${ROUTES.panel.admin.agency(id)}?tipo=propiedades`}
          active={selectedQueue === "property"}
          label="Propiedades"
          count={propertyCount}
          Icon={PanelsTopLeft}
        />
        <QueueTab
          href={`${ROUTES.panel.admin.agency(id)}?tipo=proyectos`}
          active={selectedQueue === "project"}
          label="Proyectos"
          count={projectCount}
          Icon={FolderKanban}
        />
      </div>

      {selectedQueue === "property" ? (
        <ReviewQueue
          agencyId={id}
          emptyLabel="No hay propiedades pendientes de revisión."
          kind="property"
          items={agency.properties}
        />
      ) : (
        <ReviewQueue
          agencyId={id}
          emptyLabel="No hay proyectos pendientes de revisión."
          kind="project"
          items={agency.projects}
        />
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  Icon,
}: {
  label: string;
  value: number;
  Icon: typeof ClipboardList;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <Icon className="size-4 text-brand" aria-hidden="true" />
      <p className="mt-2 text-[10px] font-black uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black text-brand">{value}</p>
    </div>
  );
}

function QueueTab({
  href,
  active,
  label,
  count,
  Icon,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
  Icon: typeof PanelsTopLeft;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-2.5 whitespace-nowrap rounded-card px-4 py-2.5 text-sm font-bold transition-colors ${
        active
          ? "bg-surface text-brand shadow-sm ring-1 ring-edge"
          : "text-muted hover:bg-surface/70 hover:text-brand"
      }`}
    >
      <Icon className="size-4 text-accent" aria-hidden="true" />
      {label}
      <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-brand">
        {count}
      </span>
    </Link>
  );
}

function ReviewQueue({
  agencyId,
  emptyLabel,
  kind,
  items,
}: ReviewQueueProps) {
  return (
    <section className="min-w-0">
      {items.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
            <span className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              {kind === "property" ? (
                <PanelsTopLeft className="size-8" aria-hidden="true" />
              ) : (
                <FolderKanban className="size-8" aria-hidden="true" />
              )}
            </span>
            <p className="text-base font-bold text-brand">
              {kind === "property" ? "Todo en orden por aquí" : "Aún no hay proyectos en cola"}
            </p>
            <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted">{emptyLabel}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {kind === "property"
            ? items.map((item) => (
                <ReviewItem
                  key={item.id}
                  agencyId={agencyId}
                  kind="property"
                  itemId={item.id}
                  name={item.title}
                  status={item.status}
                  details={<AgencyPublicationDetails kind="property" item={item} />}
                />
              ))
            : items.map((item) => (
                <ReviewItem
                  key={item.id}
                  agencyId={agencyId}
                  kind="project"
                  itemId={item.id}
                  name={item.name}
                  status={item.status}
                  details={<AgencyPublicationDetails kind="project" item={item} />}
                />
              ))}
        </div>
      )}
    </section>
  );
}

type ReviewQueueProps =
  | {
      agencyId: string;
      emptyLabel: string;
      kind: "property";
      items: AdminAgencyPropertyReview[];
    }
  | {
      agencyId: string;
      emptyLabel: string;
      kind: "project";
      items: AdminAgencyProjectReview[];
    };

function ReviewItem({
  agencyId,
  kind,
  itemId,
  name,
  status,
  details,
}: {
  agencyId: string;
  kind: "property" | "project";
  itemId: string;
  name: string;
  status?: string;
  details: React.ReactNode;
}) {
  const ItemIcon = kind === "property" ? Building2 : FolderKanban;
  const kindLabel = kind === "property" ? "Propiedad" : "Proyecto";

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-[var(--shadow-pop)]">
      <CardContent className="flex min-w-0 flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <ItemIcon className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-accent">
                {kindLabel}
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-warning">
                <span className="size-1.5 rounded-full bg-warning" />
                {status === "PENDING_REVIEW" ? "En revisión" : status ?? "En revisión"}
              </span>
            </div>
            <h2 className="mt-1 break-words text-base font-black leading-snug text-ink">
              {name}
            </h2>
          </div>
        </div>

        <form
          action={reviewAgencyPublication}
          className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto"
        >
          <input type="hidden" name="itemId" value={itemId} />
          <input type="hidden" name="agencyId" value={agencyId} />
          <input type="hidden" name="kind" value={kind} />
          {details}
          <button
            name="action"
            value="publish"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-card bg-success px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-success/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-success"
          >
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Publicar
          </button>
          <button
            name="action"
            value="reject"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-card border border-error/30 bg-error/5 px-4 py-2 text-xs font-bold text-error transition-colors hover:bg-error hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
          >
            <XCircle className="size-4" aria-hidden="true" />
            Rechazar
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
