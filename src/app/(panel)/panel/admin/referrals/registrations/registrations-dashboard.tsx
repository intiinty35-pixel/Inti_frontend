"use client";

import Link from "next/link";
import styles from "../ranking/ranking-table.module.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarRange, Coins, RefreshCw, Search, UsersRound } from "lucide-react";
import { ROUTES } from "@/shared/config/routes";

interface RegistrationMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface RegistrationInviter {
  id: string;
  name: string;
  email: string;
  code: string;
}

interface RegistrationItem {
  id: string;
  newReferrer: RegistrationMember;
  inviter: RegistrationInviter;
  inviterCode: string;
  pointsAwarded: number;
  createdAt: string;
}

interface RegistrationsResponse {
  generatedAt: string;
  total: number;
  page: number;
  pageSize: number;
  totals: { registrations: number; points: number };
  items: RegistrationItem[];
}

const PAGE_SIZE = 12;
const inputClass = "h-10 min-w-0 w-full rounded-card border border-edge bg-white px-3 text-sm font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/15";
const buttonClass = "inline-flex h-10 items-center justify-center gap-2 rounded-card border border-edge px-3 text-xs font-bold text-brand hover:border-brand disabled:opacity-40";

function boliviaDate(daysAgo = 0) {
  return new Date(Date.now() - 5 * 3_600_000 - daysAgo * 86_400_000).toISOString().slice(0, 10);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/La_Paz",
  }).format(new Date(value));
}

export function RegistrationReferralsDashboard() {
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<RegistrationsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(true);
  const requestId = useRef(0);
  const invalidateRequest = useCallback(() => { requestId.current++; }, []);

  const query = useCallback((paginated = true) => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (paginated) { params.set("page", String(page)); params.set("pageSize", String(PAGE_SIZE)); }
    return params.toString();
  }, [search, from, to, page]);

  const load = useCallback(async () => {
    const current = ++requestId.current;
    try {
      const response = await fetch(`/api/admin/referrals/registrations?${query()}`, { cache: "no-store" });
      if (!response.ok) throw new Error();
      const body = await response.json() as RegistrationsResponse;
      if (current !== requestId.current) return;
      const last = Math.max(1, Math.ceil(body.total / PAGE_SIZE));
      if (page > last) { setPage(last); return; }
      setData(body);
      setError(null);
    } catch {
      if (current === requestId.current) setError("No se pudieron cargar las inscripciones. Intenta actualizar.");
    }
  }, [query, page]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 300);
    return () => { window.clearTimeout(timer); invalidateRequest(); };
  }, [load, invalidateRequest]);

  useEffect(() => {
    if (!live) return;
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void load(); }, 15_000);
    return () => window.clearInterval(timer);
  }, [live, load]);

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));
  const displayedPage = data?.page ?? page;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <section className="relative overflow-hidden rounded-card border border-edge bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-brand" aria-hidden="true" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-accent">Programa de referidos</p>
            <h1 className="mt-2 font-display text-3xl font-black tracking-tight text-brand sm:text-4xl">Inscripciones por código</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted">Miembros que se inscribieron al Inti Club usando el código de otro miembro. Cada inscripción otorga 50 puntos al invitante.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setLive(!live)} className={buttonClass} aria-pressed={live} title="Actualización cada 15 segundos">
              <span className={`size-2 rounded-full ${live ? "animate-pulse bg-success" : "bg-muted"}`} />{live ? "En vivo" : "Pausado"}
            </button>
            <button type="button" onClick={() => void load()} className={buttonClass}>
              <RefreshCw className="size-4" />Actualizar
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-card border border-edge bg-surface p-4 text-center shadow-[var(--shadow-card)]">
          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <UsersRound className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted">Inscripciones</p>
              <p className="mt-1 font-display text-3xl font-black text-brand">{data?.totals.registrations.toLocaleString("es-BO") ?? "–"}</p>
            </div>
          </div>
        </div>
        <div className="rounded-card border border-edge bg-surface p-4 text-center shadow-[var(--shadow-card)]">
          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
              <Coins className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted">Puntos otorgados</p>
              <p className="mt-1 font-display text-3xl font-black text-brand">{data?.totals.points.toLocaleString("es-BO") ?? "–"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-card border border-edge bg-surface p-3 shadow-[var(--shadow-card)] sm:p-4">
        <div className="grid grid-cols-2 items-end gap-3 xl:grid-cols-[2fr_1fr_1fr]">
          <label className="col-span-2 grid min-w-0 gap-1.5 text-xs font-bold text-brand xl:col-span-1">
            Buscar miembro o invitante
            <span className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted" />
              <input
                value={search}
                maxLength={80}
                onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                placeholder="Nombre, correo o código de miembro"
                className={`${inputClass} h-11 pl-9 sm:h-10`}
              />
            </span>
          </label>
          <label className="grid min-w-0 gap-1.5 text-xs font-bold text-brand">
            Desde
            <input type="date" value={from} max={to || undefined} onChange={(event) => { setFrom(event.target.value); setPage(1); }} className={`${inputClass} h-11 px-2 sm:h-10 sm:px-3`} />
          </label>
          <label className="grid min-w-0 gap-1.5 text-xs font-bold text-brand">
            Hasta
            <input type="date" value={to} min={from || undefined} onChange={(event) => { setTo(event.target.value); setPage(1); }} className={`${inputClass} h-11 px-2 sm:h-10 sm:px-3`} />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto pb-1 sm:gap-2 sm:pb-0">
          <CalendarRange className="size-4 shrink-0 text-muted" />
          {([["Todo", null], ["Hoy", 0], ["7 días", 6], ["4 semanas", 27], ["3 meses", 89]] as const).map(([label, days]) => (
            <button
              type="button"
              key={label}
              onClick={() => { setFrom(days === null ? "" : boliviaDate(days)); setTo(days === null ? "" : boliviaDate()); setPage(1); }}
              className="shrink-0 whitespace-nowrap rounded-full border border-edge px-2 py-1.5 text-xs font-bold text-brand hover:border-brand sm:px-3 sm:py-1"
            >
              {label}
            </button>
          ))}
          </div>
          {(search || from || to) && (
            <button
              type="button"
              onClick={() => { setSearch(""); setFrom(""); setTo(""); setPage(1); }}
              className="text-xs font-bold text-brand underline"
            >
              Limpiar filtros
            </button>
          )}
          {data && (
            <span className="ml-auto w-full text-right text-[11px] font-semibold text-muted sm:w-auto">
              Actualizado {new Intl.DateTimeFormat("es-BO", { timeStyle: "medium", timeZone: "America/La_Paz" }).format(new Date(data.generatedAt))}
            </span>
          )}
        </div>
      </section>

      {error && (
        <p role="alert" className="rounded-card bg-error/10 px-4 py-3 text-sm font-semibold text-error">
          {error}
        </p>
      )}

      <section className={styles.sheet} aria-label="Inscripciones por código">
        <div className={styles.scroll}>
          <table className={styles.table}>
            <thead><tr>{['N.º', 'Miembro inscrito', 'Correo del miembro', 'Teléfono', 'Invitante', 'Código usado', 'Correo del invitante', 'Puntos', 'Fecha de inscripción'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
            <tbody>
              {!data ? <tr><td colSpan={9} className={styles.empty}>{error ? 'No se pudo cargar la lista.' : 'Cargando inscripciones…'}</td></tr> : !data.items.length ? <tr><td colSpan={9} className={styles.empty}>No hay inscripciones con estos filtros.</td></tr> : data.items.map((row, index) => (
                <tr key={row.id}>
                  <td className={styles.rank}>{(displayedPage - 1) * PAGE_SIZE + index + 1}</td>
                  <td><span className={styles.name} title={row.newReferrer.name}>{row.newReferrer.name}</span></td>
                  <td><a className={styles.email} title={row.newReferrer.email} href={`mailto:${row.newReferrer.email}`}>{row.newReferrer.email || '—'}</a></td>
                  <td>{row.newReferrer.phone ? <a href={`tel:${row.newReferrer.phone.replace(/\s/g, '')}`}>{row.newReferrer.phone}</a> : '—'}</td>
                  <td><Link className={styles.name} title={row.inviter.name} href={ROUTES.panel.admin.referrer(row.inviter.id)}>{row.inviter.name}</Link></td>
                  <td className={styles.code}>{row.inviter.code}</td>
                  <td><a className={styles.email} title={row.inviter.email} href={row.inviter.email ? `mailto:${row.inviter.email}` : undefined}>{row.inviter.email || '—'}</a></td>
                  <td className={styles.number}>+{row.pointsAwarded.toLocaleString('es-BO')}</td>
                  <td>{formatDate(row.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {data && data.total > 0 && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-muted">
            Mostrando {(displayedPage - 1) * PAGE_SIZE + 1} al {Math.min(displayedPage * PAGE_SIZE, data.total)} de {data.total} inscripciones
          </p>
          <nav aria-label="Paginación de inscripciones" className="flex items-center gap-3">
            <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className={buttonClass}>
              Anterior
            </button>
            <span className="text-sm font-semibold text-brand">
              Página {displayedPage} de {totalPages}
            </span>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className={buttonClass}>
              Siguiente
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
