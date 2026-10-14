"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarRange, FileSpreadsheet, Loader2, Mail, MessageCircle, Phone, RefreshCw, Search, Trophy } from "lucide-react";
import { MemberActions } from "./member-actions";

interface RankingRow {
  rank: number;
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  paymentType: string;
  referralsCount: number;
  visitCount: number;
  completedCount: number;
  points: number;
  lastReferralAt: string | null;
}

interface RankingResponse {
  generatedAt: string;
  totals: { members: number; referrals: number; completed: number; points: number };
  items: RankingRow[];
}

const REFRESH_MS = 15_000;

/** Fecha de Lima (UTC-5) como YYYY-MM-DD, `daysAgo` dias atras. */
function limaDate(daysAgo = 0) {
  return new Date(Date.now() - 5 * 3_600_000 - daysAgo * 86_400_000).toISOString().slice(0, 10);
}

const PRESETS = [
  { label: "Todo", from: "", to: "" },
  { label: "Hoy", from: () => limaDate(0), to: () => limaDate(0) },
  { label: "7 días", from: () => limaDate(6), to: () => limaDate(0) },
  { label: "4 semanas", from: () => limaDate(27), to: () => limaDate(0) },
  { label: "3 meses", from: () => limaDate(89), to: () => limaDate(0) },
] as const;

function resolve(value: string | (() => string)) {
  return typeof value === "function" ? value() : value;
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export function RankingDashboard() {
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState<RankingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [live, setLive] = useState(true);
  const requestId = useRef(0);

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return params.toString();
  }, [search, from, to]);

  const load = useCallback(async () => {
    const current = ++requestId.current;
    try {
      const query = buildQuery();
      const response = await fetch(`/api/admin/referrals/ranking${query ? `?${query}` : ""}`, { cache: "no-store" });
      if (!response.ok) throw new Error();
      const body = (await response.json()) as RankingResponse;
      if (current === requestId.current) {
        setData(body);
        setError(null);
      }
    } catch {
      if (current === requestId.current) setError("No se pudo actualizar el ranking.");
    } finally {
      if (current === requestId.current) setLoading(false);
    }
  }, [buildQuery]);

  // Carga al cambiar filtros (con una pequena espera al escribir) y se refresca sola mientras la pestaña esta visible.
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 300);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [live, load]);

  async function exportExcel() {
    setExporting(true);
    try {
      const query = buildQuery();
      const response = await fetch(`/api/admin/referrals/ranking/export/excel${query ? `?${query}` : ""}`);
      if (!response.ok) throw new Error();
      const url = window.URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = `quienes-mas-refirieron-${limaDate(0)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Error al exportar a Excel. Intenta nuevamente.");
    } finally {
      setExporting(false);
    }
  }

  const totals = data?.totals;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <section className="relative overflow-hidden rounded-card border border-edge bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-brand" aria-hidden="true" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-accent">Control de miembros</p>
            <h1 className="mt-2 font-display text-3xl font-black tracking-tight text-brand sm:text-4xl">
              Miembros
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted">
              Ranking de miembros por cantidad de referidos, con sus datos de contacto para llamarlos.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setLive((value) => !value)}
              className={`inline-flex h-10 items-center gap-2 rounded-card border px-3 text-xs font-bold ${
                live ? "border-success/40 bg-success/10 text-success" : "border-edge text-muted"
              }`}
              title={live ? "Se actualiza cada 15 segundos" : "Actualización automática pausada"}
            >
              <span className={`size-2 rounded-full ${live ? "animate-pulse bg-success" : "bg-muted"}`} aria-hidden="true" />
              {live ? "En vivo" : "Pausado"}
            </button>
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex h-10 items-center gap-2 rounded-card border border-edge px-3 text-xs font-bold text-brand hover:border-brand"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Actualizar
            </button>
            <button
              type="button"
              onClick={() => void exportExcel()}
              disabled={exporting || !data || data.items.length === 0}
              className="inline-flex h-10 items-center gap-2 rounded-card border-2 border-green-500 px-3 text-xs font-bold text-green-600 hover:bg-green-50 disabled:opacity-50"
            >
              {exporting ? <Loader2 className="size-4 animate-spin" /> : <FileSpreadsheet className="size-4" />}
              Excel
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Miembros" value={totals?.members} />
        <Kpi label="Referidos" value={totals?.referrals} />
        <Kpi label="Concretados" value={totals?.completed} />
        <Kpi label="Puntos" value={totals?.points} />
      </section>

      <section className="rounded-card border border-edge bg-surface p-4 shadow-[var(--shadow-card)]">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <label className="grid gap-1.5 text-xs font-bold text-brand">
            Buscar por nombre
            <span className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Miembro, correo o código"
                className="h-10 w-full rounded-card border border-edge bg-white pl-9 pr-3 text-sm font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
              />
            </span>
          </label>
          <label className="grid gap-1.5 text-xs font-bold text-brand">
            Desde
            <input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="h-10 rounded-card border border-edge bg-white px-3 text-sm font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
            />
          </label>
          <label className="grid gap-1.5 text-xs font-bold text-brand">
            Hasta
            <input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="h-10 rounded-card border border-edge bg-white px-3 text-sm font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
            />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CalendarRange className="size-4 text-muted" aria-hidden="true" />
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setFrom(resolve(preset.from));
                setTo(resolve(preset.to));
              }}
              className="rounded-full border border-edge px-3 py-1 text-xs font-bold text-brand transition-colors hover:border-brand"
            >
              {preset.label}
            </button>
          ))}
          {data ? (
            <span className="ml-auto text-[11px] font-semibold text-muted">
              Actualizado {new Intl.DateTimeFormat("es-PE", { timeStyle: "medium" }).format(new Date(data.generatedAt))}
            </span>
          ) : null}
        </div>
      </section>

      {error ? <p className="rounded-card bg-error/10 px-4 py-3 text-sm font-semibold text-error">{error}</p> : null}

      <section className="overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="bg-surface-muted text-[11px] font-black uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-4 py-3">Puesto</th>
                <th className="px-4 py-3">Miembro</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Tipo de pago</th>
                <th className="px-4 py-3 text-right">Referidos</th>
                <th className="px-4 py-3 text-right">Concretados</th>
                <th className="px-4 py-3 text-right">Puntos</th>
                <th className="px-4 py-3">Último referido</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge">
              {loading && !data ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-muted">
                    Cargando ranking...
                  </td>
                </tr>
              ) : data && data.items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-muted">
                    No hay miembros con ese filtro.
                  </td>
                </tr>
              ) : (
                data?.items.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-muted/60">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex size-8 items-center justify-center rounded-full text-xs font-black ${
                          row.rank <= 3 ? "bg-accent text-on-accent" : "bg-brand-soft text-brand"
                        }`}
                      >
                        {row.rank <= 3 ? <Trophy className="size-4" aria-hidden="true" /> : row.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-brand">{row.name}</p>
                      <p className="text-xs text-muted">{row.code}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 text-xs">
                        <a href={`tel:${row.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 font-semibold text-ink hover:text-brand">
                          <Phone className="size-3.5 text-accent" aria-hidden="true" />
                          {row.phone}
                        </a>
                        <a
                          href={`https://wa.me/${row.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 font-semibold text-ink hover:text-brand"
                        >
                          <MessageCircle className="size-3.5 text-accent" aria-hidden="true" />
                          WhatsApp
                        </a>
                        <a href={`mailto:${row.email}`} className="inline-flex items-center gap-1.5 break-all font-semibold text-ink hover:text-brand">
                          <Mail className="size-3.5 shrink-0 text-accent" aria-hidden="true" />
                          {row.email}
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-ink">{row.paymentType}</td>
                    <td className="px-4 py-3 text-right text-base font-black text-brand">{row.referralsCount}</td>
                    <td className="px-4 py-3 text-right font-bold text-ink">{row.completedCount}</td>
                    <td className="px-4 py-3 text-right font-bold text-ink">{row.points.toLocaleString("es-PE")}</td>
                    <td className="px-4 py-3 text-xs text-muted">{formatDate(row.lastReferralAt)}</td>
                    <td className="px-4 py-3"><MemberActions id={row.id} name={row.name} onUpdated={load} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="rounded-card border border-edge bg-surface p-4 text-center shadow-[var(--shadow-card)]">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-black tracking-tight text-brand">
        {value === undefined ? "–" : value.toLocaleString("es-PE")}
      </p>
    </div>
  );
}
