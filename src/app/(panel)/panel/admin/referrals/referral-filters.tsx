import Link from "next/link";
import { CalendarRange, Search, X } from "lucide-react";
import { ROUTES } from "@/shared/config/routes";

const BASE = ROUTES.panel.admin.referrals;

/** Fecha de hoy en Lima (UTC-5) como YYYY-MM-DD, menos `days` dias. */
function limaDate(daysAgo = 0) {
  const date = new Date(Date.now() - 5 * 60 * 60 * 1000 - daysAgo * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}

function presetHref(from: string, search: string) {
  const params = new URLSearchParams({ from, to: limaDate(0) });
  if (search) params.set("search", search);
  return `${BASE}?${params.toString()}`;
}

export function ReferralFilters({ search, from, to }: { search: string; from: string; to: string }) {
  const active = Boolean(search || from || to);
  const presets = [
    { label: "Hoy", from: limaDate(0) },
    { label: "Últimos 7 días", from: limaDate(6) },
    { label: "Últimas 4 semanas", from: limaDate(27) },
    { label: "Últimos 3 meses", from: limaDate(89) },
  ];

  return (
    <section className="rounded-card border border-edge bg-surface p-4 shadow-[var(--shadow-card)]">
      <form method="get" action={BASE} className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto] lg:items-end">
        <label className="grid gap-1.5 text-xs font-bold text-brand">
          Buscar por nombre
          <span className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              name="search"
              defaultValue={search}
              placeholder="Miembro, referido, correo o código"
              className="h-10 w-full rounded-card border border-edge bg-white pl-9 pr-3 text-sm font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
            />
          </span>
        </label>
        <label className="grid gap-1.5 text-xs font-bold text-brand">
          Desde
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="h-10 rounded-card border border-edge bg-white px-3 text-sm font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </label>
        <label className="grid gap-1.5 text-xs font-bold text-brand">
          Hasta
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="h-10 rounded-card border border-edge bg-white px-3 text-sm font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-card bg-brand px-4 text-sm font-bold text-on-brand hover:bg-brand-hover"
          >
            <CalendarRange className="size-4" aria-hidden="true" />
            Filtrar
          </button>
          {active ? (
            <Link
              href={BASE}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-card border border-edge px-3 text-sm font-bold text-muted hover:border-brand hover:text-brand"
            >
              <X className="size-4" aria-hidden="true" />
              Limpiar
            </Link>
          ) : null}
        </div>
      </form>
      <div className="mt-3 flex flex-nowrap items-center gap-1 overflow-x-auto sm:gap-2">
        <Link
          href={search ? `${BASE}?${new URLSearchParams({ search }).toString()}` : BASE}
          className={`shrink-0 whitespace-nowrap rounded-full border px-2 py-1 text-xs font-bold transition-colors sm:px-3 ${!from && !to ? "border-brand bg-brand text-on-brand" : "border-edge text-brand hover:border-brand"}`}
        >
          Todo
        </Link>
        {presets.map((preset) => (
          <Link
            key={preset.label}
            href={presetHref(preset.from, search)}
            className={`shrink-0 whitespace-nowrap rounded-full border px-2 py-1 text-xs font-bold transition-colors sm:px-3 ${
              from === preset.from && to === limaDate(0)
                ? "border-brand bg-brand text-on-brand"
                : "border-edge text-brand hover:border-brand"
            }`}
          >
            {preset.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
