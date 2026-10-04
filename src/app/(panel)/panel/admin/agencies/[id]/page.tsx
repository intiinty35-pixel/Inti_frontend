import Link from "next/link";
import { revalidatePath } from "next/cache";
import {
  BuildingIcon,
  Card,
  ChartIcon,
  CheckCircleIcon,
} from "@/shared/ui";
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

  return (
    <div className="flex flex-col gap-6">
      <header>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <Link
            href={ROUTES.panel.admin.agencies}
            className="inline-flex min-h-10 max-w-full items-center justify-self-start gap-2 rounded-card border border-edge bg-surface px-3.5 py-2 text-xs font-bold text-brand transition-colors hover:border-accent hover:bg-accent/10 sm:text-sm"
          >
            ← Volver a inmobiliarias
          </Link>
          <h1 className="min-w-0 break-words text-2xl font-light tracking-tight text-brand sm:text-center sm:text-3xl">{name}</h1>
          <span aria-hidden className="hidden sm:block" />
        </div>
        <p className="mt-1 text-center text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
          Cola de revisión · Inmobiliaria
        </p>
        <p className="mt-2 break-words text-center text-sm text-muted">
          {agency.city} · {agency.user.email} · WhatsApp {agency.whatsapp ?? "—"}
        </p>
      </header>
      <div className="flex w-fit max-w-full gap-2 overflow-x-auto rounded-md bg-surface-muted/70 p-1.5">
        <Link
          href={`${ROUTES.panel.admin.agency(id)}?tipo=propiedades`}
          aria-current={selectedQueue === "property" ? "page" : undefined}
          className={`flex items-center gap-2.5 whitespace-nowrap rounded-sm px-4 py-2.5 text-sm font-bold transition-colors ${
            selectedQueue === "property"
              ? "bg-surface text-brand shadow-sm ring-1 ring-edge"
              : "text-muted hover:bg-surface/70 hover:text-brand"
          }`}
        >
          <BuildingIcon className="size-4 text-accent-hover" />
          Propiedades
          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-brand">
            {agency.properties.length}
          </span>
        </Link>
        <Link
          href={`${ROUTES.panel.admin.agency(id)}?tipo=proyectos`}
          aria-current={selectedQueue === "project" ? "page" : undefined}
          className={`flex items-center gap-2.5 whitespace-nowrap rounded-sm px-4 py-2.5 text-sm font-bold transition-colors ${
            selectedQueue === "project"
              ? "bg-surface text-brand shadow-sm ring-1 ring-edge"
              : "text-muted hover:bg-surface/70 hover:text-brand"
          }`}
        >
          <ChartIcon className="size-4 text-accent-hover" />
          Proyectos
          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-brand">
            {agency.projects.length}
          </span>
        </Link>
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

function ReviewQueue({
  agencyId,
  emptyLabel,
  kind,
  items,
}: ReviewQueueProps) {
  const rows =
    kind === "property"
      ? items.map((item) => (
          <ReviewItem
            key={item.id}
            agencyId={agencyId}
            kind="property"
            itemId={item.id}
            name={item.title}
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
            details={<AgencyPublicationDetails kind="project" item={item} />}
          />
        ));

  return (
    <section className="min-w-0">
      {items.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
          <span className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-accent/15 text-brand">
            {kind === "property" ? (
              <BuildingIcon className="size-8 text-accent-hover" />
            ) : (
              <ChartIcon className="size-8 text-accent-hover" />
            )}
          </span>
          <p className="text-base font-bold text-brand">
            {kind === "property" ? "Todo en orden por aquí" : "Aún no hay proyectos en cola"}
          </p>
          <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted">{emptyLabel}</p>
        </div>
      ) : (
        <div className="grid max-h-[70vh] gap-3 overflow-y-auto pr-1">{rows}</div>
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
  details,
}: {
  agencyId: string;
  kind: "property" | "project";
  itemId: string;
  name: string;
  details: React.ReactNode;
}) {
  const ItemIcon = kind === "property" ? BuildingIcon : ChartIcon;

  return (
    <Card className="flex min-w-0 flex-col gap-4 border-l-[3px] border-l-accent p-4 transition-shadow hover:shadow-[var(--shadow-pop)] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex w-full min-w-0 items-center gap-3 sm:flex-1">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent-hover">
          <ItemIcon className="size-5" />
        </span>
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:self-center">
          <p className="min-w-0 truncate font-bold leading-snug text-ink">{name}</p>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-sm bg-warning/15 px-2 py-1 text-[10px] font-bold tracking-wide text-warning uppercase">
            <span className="size-1.5 rounded-full bg-warning" />
            En revisión
          </span>
        </div>
      </div>
      <form
        action={reviewAgencyPublication}
        className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row"
      >
        <input type="hidden" name="itemId" value={itemId} />
        <input type="hidden" name="agencyId" value={agencyId} />
        <input type="hidden" name="kind" value={kind} />
        {details}
        <button
          name="action"
          value="publish"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-card bg-success px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-success/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-success cursor-pointer"
        >
          <CheckCircleIcon className="size-4" />
          Habilitar y publicar
        </button>
        <button
          name="action"
          value="reject"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-card border border-error/30 bg-error/5 px-4 py-2 text-xs font-bold text-error transition-colors hover:bg-error hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error cursor-pointer"
        >
          Rechazar
        </button>
      </form>
    </Card>
  );
}
