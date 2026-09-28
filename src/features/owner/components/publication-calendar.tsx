import type { OwnerProperty } from "@/features/owner/types/property";
import { cn } from "@/shared/lib/cn";

type PublicationState = "published" | "expiring" | "expired";

interface PublicationDay {
  day: number;
  state: PublicationState;
  count: number;
}

export interface PublicationCalendarProps {
  properties: OwnerProperty[];
  expiresAt?: string | null;
  now: number;
}

const MONTHS = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
] as const;

const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"] as const;

const STATE_CLASS: Record<PublicationState, string> = {
  published: "bg-success text-white ring-success/20",
  expiring: "bg-warning text-white ring-warning/25",
  expired: "bg-error text-white ring-error/25",
};

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function mondayFirstWeekday(date: Date) {
  return (date.getDay() + 6) % 7;
}

function getPublicationState(expiresTime: number | null, now: number): PublicationState {
  if (expiresTime && expiresTime < now) return "expired";
  if (expiresTime && expiresTime - now <= 7 * 86_400_000) return "expiring";
  return "published";
}

export function PublicationCalendar({ properties, expiresAt, now }: PublicationCalendarProps) {
  const current = new Date(now);
  const year = current.getFullYear();
  const month = current.getMonth();
  const monthStart = new Date(year, month, 1);
  const leadingDays = mondayFirstWeekday(monthStart);
  const totalDays = daysInMonth(year, month);
  const expiresTime = expiresAt ? new Date(expiresAt).getTime() : null;

  const publicationDays = properties.reduce<Map<number, PublicationDay>>((map, property) => {
    const published = new Date(property.publishedAt);
    if (published.getFullYear() !== year || published.getMonth() !== month) return map;

    const day = published.getDate();
    const state = getPublicationState(expiresTime, now);
    const previous = map.get(day);

    map.set(day, {
      day,
      state: previous?.state === "expired" ? "expired" : state,
      count: (previous?.count ?? 0) + 1,
    });

    return map;
  }, new Map<number, PublicationDay>());

  return (
    <section className="rounded-card border border-edge bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between border-b border-edge pb-4">
        <div>
          <p className="font-display text-sm font-black tracking-wide text-brand uppercase">
            Calendario de publicaciones
          </p>
          <p className="mt-1 text-[11px] font-semibold text-muted">Estado visual de tus avisos del mes</p>
        </div>
        <span className="rounded-full border border-edge px-3 py-1 text-[11px] font-bold text-ink">
          {properties.length} avisos
        </span>
      </div>

      <div className="mt-5 flex items-center justify-center gap-3">
        <p className="font-display text-base font-black tracking-wide text-ink">
          {MONTHS[month]} - {year}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2 text-center">
        {WEEKDAYS.map((weekday) => (
          <span key={weekday} className="text-xs font-black text-ink">
            {weekday}
          </span>
        ))}
        {Array.from({ length: leadingDays }).map((_, index) => (
          <span key={`empty-${index}`} aria-hidden className="h-9" />
        ))}
        {Array.from({ length: totalDays }).map((_, index) => {
          const day = index + 1;
          const publication = publicationDays.get(day);
          const isToday = day === current.getDate();

          return (
            <span
              key={day}
              title={publication ? `${publication.count} publicacion(es)` : undefined}
              className={cn(
                "relative flex h-9 items-center justify-center rounded-full text-sm font-bold text-muted",
                isToday && "ring-2 ring-brand/30",
                publication && `text-white shadow-sm ring-4 ${STATE_CLASS[publication.state]}`,
              )}
            >
              {day}
              {publication && publication.count > 1 ? (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-ink text-[9px] text-white">
                  {publication.count}
                </span>
              ) : null}
            </span>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-[10px] font-bold text-muted">
        <span className="flex items-center gap-1.5">
          <i className="size-2.5 rounded-full bg-success" /> Publicada
        </span>
        <span className="flex items-center gap-1.5">
          <i className="size-2.5 rounded-full bg-warning" /> Por vencer
        </span>
        <span className="flex items-center gap-1.5">
          <i className="size-2.5 rounded-full bg-error" /> Vencida
        </span>
      </div>
    </section>
  );
}
