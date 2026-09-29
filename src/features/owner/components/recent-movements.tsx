import type { Lead, OwnerProperty } from "@/features/owner/types/property";
import type { Subscription } from "@/features/owner/types/plan";
import { cn } from "@/shared/lib/cn";

type MovementKind = "publication" | "lead" | "subscription" | "sale";

interface Movement {
  id: string;
  kind: MovementKind;
  title: string;
  detail: string;
  date: string;
}

export interface RecentMovementsProps {
  properties: OwnerProperty[];
  leads: Lead[];
  subscription: Subscription | null;
}

const KIND_STYLES: Record<MovementKind, string> = {
  publication: "bg-success/12 text-success",
  lead: "bg-info/12 text-info",
  subscription: "bg-brand-soft text-brand",
  sale: "bg-accent/20 text-brand",
};

const KIND_LABELS: Record<MovementKind, string> = {
  publication: "Publicacion",
  lead: "Consulta",
  subscription: "Membresia",
  sale: "Venta",
};

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function buildMovements(properties: OwnerProperty[], leads: Lead[], subscription: Subscription | null): Movement[] {
  const propertyMovements = properties.map<Movement>((property) => ({
    id: `property-${property.id}`,
    kind: property.status === "vendido" || property.status === "alquilado" ? "sale" : "publication",
    title: property.title,
    detail:
      property.status === "vendido"
        ? "Marcada como vendida"
        : property.status === "alquilado"
          ? "Marcada como alquilada"
          : "Propiedad publicada",
    date: property.publishedAt,
  }));

  const leadMovements = leads.map<Movement>((lead) => ({
    id: `lead-${lead.id}`,
    kind: "lead",
    title: lead.project?.name ?? lead.property?.title ?? "Publicación",
    detail: `Nueva consulta de ${lead.name}`,
    date: lead.createdAt,
  }));

  const subscriptionMovements =
    subscription?.startedAt || subscription?.expiresAt
      ? [
          {
            id: `subscription-${subscription.id}`,
            kind: "subscription" as const,
            title: subscription.plan.name,
            detail:
              subscription.status === "ACTIVE"
                ? "Asociada a una nueva membresia"
                : `Membresia ${subscription.status.toLowerCase().replaceAll("_", " ")}`,
            date: subscription.startedAt ?? subscription.expiresAt!,
          },
        ]
      : [];

  return [...propertyMovements, ...leadMovements, ...subscriptionMovements]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
}

export function RecentMovements({ properties, leads, subscription }: RecentMovementsProps) {
  const movements = buildMovements(properties, leads, subscription);

  return (
    <section className="rounded-card border border-edge bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="border-b border-edge pb-4">
        <p className="font-display text-sm font-black tracking-wide text-brand uppercase">Ultimos movimientos</p>
        <p className="mt-1 text-[11px] font-semibold text-muted">Publicaciones, reportes, ventas y membresias</p>
      </div>

      {movements.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-3">
          {movements.map((movement) => (
            <li key={movement.id} className="flex gap-3 rounded-lg border border-edge/80 bg-canvas/60 p-3">
              <span
                className={cn(
                  "mt-0.5 flex h-8 min-w-8 items-center justify-center rounded-lg text-[10px] font-black",
                  KIND_STYLES[movement.kind],
                )}
              >
                {KIND_LABELS[movement.kind].slice(0, 2)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-ink">{movement.title}</span>
                <span className="mt-0.5 block text-xs text-muted">{movement.detail}</span>
              </span>
              <time className="shrink-0 text-[11px] font-bold text-muted" dateTime={movement.date}>
                {formatShortDate(movement.date)}
              </time>
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-8 text-center">
          <p className="text-sm font-bold text-ink">Sin movimientos todavia</p>
          <p className="mt-1 text-xs text-muted">Tus ultimas acciones apareceran aqui.</p>
        </div>
      )}
    </section>
  );
}
