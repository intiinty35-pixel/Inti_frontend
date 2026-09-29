const DAY_MS = 86_400_000;

const SHORT_DATE = new Intl.DateTimeFormat("es-PE", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const FULL_DATE = new Intl.DateTimeFormat("es-PE", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export interface PublishedDateLabels {
  iso: string;
  isNew: boolean;
  relative: string;
  full: string;
  fullWithPrefix: string;
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatPublishedDate(
  publishedAt: string | null | undefined,
  fallbackCreatedAt?: string | null,
): PublishedDateLabels | null {
  const date = parseDate(publishedAt) ?? parseDate(fallbackCreatedAt);
  if (!date) return null;

  const now = new Date();
  const elapsedDays = Math.max(0, Math.floor((now.getTime() - date.getTime()) / DAY_MS));
  const iso = date.toISOString();
  const full = FULL_DATE.format(date);

  let relative: string;
  if (elapsedDays === 0) {
    relative = "Publicado hoy";
  } else if (elapsedDays < 7) {
    relative = `hace ${elapsedDays} ${elapsedDays === 1 ? "día" : "días"}`;
  } else if (elapsedDays <= 30) {
    const weeks = Math.max(1, Math.floor(elapsedDays / 7));
    relative = `hace ${weeks} ${weeks === 1 ? "semana" : "semanas"}`;
  } else {
    relative = SHORT_DATE.format(date).replace(".", "");
  }

  return {
    iso,
    isNew: elapsedDays < 7,
    relative,
    full,
    fullWithPrefix: `Publicado el ${full}`,
  };
}
