"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarRange, FileSpreadsheet, Loader2, Mail, MessageCircle, Phone, RefreshCw, Search } from "lucide-react";
import { ROUTES } from "@/shared/config/routes";
import { RecordActions } from "./record-actions";
import styles from "./records-table.module.css";

interface ReferralRecord {
  id: string; code: string; name: string; email: string; phone: string;
  status: string; statusLabel: string; interestLabel: string; availabilityLabel: string;
  points: number; createdAt: string;
  referrer: { id: string; name: string; code: string };
  project: { id: string; name: string } | null;
}
interface RecordsResponse {
  generatedAt: string; total: number; page: number; pageSize: number;
  totals: { referrals: number; completed: number; visits: number; points: number };
  items: ReferralRecord[];
}
const PAGE_SIZE = 12;
const STATUSES = [
  ["PENDING_VALIDATION", "Pendiente de validación"], ["CONTACTED", "Contactado"],
  ["VISIT", "Visita"], ["OPERATION_COMPLETED", "Operación concretada"], ["REJECTED", "Rechazado"],
];
const inputClass = "h-10 w-full rounded-card border border-edge bg-white px-3 text-sm font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/15";
const buttonClass = "inline-flex h-10 items-center justify-center gap-2 rounded-card border border-edge px-3 text-xs font-bold text-brand hover:border-brand disabled:opacity-40";
function limaDate(daysAgo = 0) {
  return new Date(Date.now() - 5 * 3_600_000 - daysAgo * 86_400_000).toISOString().slice(0, 10);
}

export function ReferralRecordsDashboard() {
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<RecordsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [live, setLive] = useState(true);
  const tableScroll = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);
  const invalidateRequest = useCallback(() => { requestId.current++; }, []);
  const query = useCallback((paginated = true) => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (status) params.set("status", status);
    if (paginated) { params.set("page", String(page)); params.set("pageSize", String(PAGE_SIZE)); }
    return params.toString();
  }, [search, from, to, status, page]);

  const load = useCallback(async () => {
    const current = ++requestId.current;
    try {
      const response = await fetch(`/api/admin/referrals/records?${query()}`, { cache: "no-store" });
      if (!response.ok) throw new Error();
      const body = await response.json() as RecordsResponse;
      if (current !== requestId.current) return;
      const last = Math.max(1, Math.ceil(body.total / PAGE_SIZE));
      if (page > last) { setPage(last); return; }
      setData(body); setError(null);
    } catch {
      if (current === requestId.current) setError("No se pudieron cargar los referidos. Intenta actualizar.");
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

  async function exportExcel() {
    setExporting(true);
    try {
      const response = await fetch(`/api/admin/referrals/records/export/excel?${query(false)}`);
      if (!response.ok) throw new Error();
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url; link.download = `referidos-ariz-${limaDate()}.xlsx`;
      document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
    } catch { setError("No se pudo exportar el Excel. Intenta nuevamente."); }
    finally { setExporting(false); }
  }
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));
  const displayedPage = data?.page ?? page;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <section className="relative overflow-hidden rounded-card border border-edge bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-brand" aria-hidden="true" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-accent">Programa de referidos</p>
            <h1 className="mt-2 font-display text-3xl font-black tracking-tight text-brand sm:text-4xl">Control de referidos</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted">Cada fila es un referido. Consulta su contacto, estado y el miembro Ariz que lo registró.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setLive(!live)} className={buttonClass} aria-pressed={live} title="Actualización cada 15 segundos">
              <span className={`size-2 rounded-full ${live ? "animate-pulse bg-success" : "bg-muted"}`} />{live ? "En vivo" : "Pausado"}
            </button>
            <button type="button" onClick={() => void load()} className={buttonClass}><RefreshCw className="size-4" />Actualizar</button>
            <button type="button" onClick={() => void exportExcel()} disabled={exporting || !data?.total} className={`${buttonClass} border-green-500 text-green-600`}>
              {exporting ? <Loader2 className="size-4 animate-spin" /> : <FileSpreadsheet className="size-4" />}Excel
            </button>
          </div>
        </div>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {([['Referidos', data?.totals.referrals], ['En visita', data?.totals.visits], ['Concretados', data?.totals.completed], ['Puntos', data?.totals.points]] as const).map(([label, value]) => (
          <div key={label} className="rounded-card border border-edge bg-surface p-4 text-center shadow-[var(--shadow-card)]">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted">{label}</p>
            <p className="mt-1 font-display text-3xl font-black text-brand">{value?.toLocaleString('es-PE') ?? '–'}</p>
          </div>
        ))}
      </section>
      <section className="rounded-card border border-edge bg-surface p-4 shadow-[var(--shadow-card)]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr]">
          <label className="grid gap-1.5 text-xs font-bold text-brand">Buscar referido o miembro Ariz
            <span className="relative"><Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted" />
              <input value={search} maxLength={80} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Nombre, correo, teléfono o código" className={`${inputClass} pl-9`} />
            </span>
          </label>
          <label className="grid gap-1.5 text-xs font-bold text-brand">Estado del referido
            <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className={inputClass}>
              <option value="">Todos los estados</option>{STATUSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-bold text-brand">Desde<input type="date" value={from} max={to || undefined} onChange={(event) => { setFrom(event.target.value); setPage(1); }} className={inputClass} /></label>
          <label className="grid gap-1.5 text-xs font-bold text-brand">Hasta<input type="date" value={to} min={from || undefined} onChange={(event) => { setTo(event.target.value); setPage(1); }} className={inputClass} /></label>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CalendarRange className="size-4 text-muted" />
          {([['Todo', null], ['Hoy', 0], ['7 días', 6], ['4 semanas', 27], ['3 meses', 89]] as const).map(([label, days]) => (
            <button type="button" key={label} onClick={() => { setFrom(days === null ? '' : limaDate(days)); setTo(days === null ? '' : limaDate()); setPage(1); }} className="rounded-full border border-edge px-3 py-1 text-xs font-bold text-brand hover:border-brand">{label}</button>
          ))}
          {(search || from || to || status) && <button type="button" onClick={() => { setSearch(''); setFrom(''); setTo(''); setStatus(''); setPage(1); }} className="text-xs font-bold text-brand underline">Limpiar filtros</button>}
          {data && <span className="ml-auto text-[11px] font-semibold text-muted">Actualizado {new Intl.DateTimeFormat('es-PE', { timeStyle: 'medium', timeZone: 'America/Lima' }).format(new Date(data.generatedAt))}</span>}
        </div>
        <p className="mt-3 text-xs text-muted">Las fechas corresponden al registro del referido. Los totales y el Excel incluyen todos los resultados del filtro.</p>
      </section>
      {error && <p role="alert" className="rounded-card bg-error/10 px-4 py-3 text-sm font-semibold text-error">{error}</p>}
      <section className="min-w-0 overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-edge px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-sm font-bold text-brand">Detalle de referidos</h2>
            <p id="records-scroll-hint" className="mt-1 text-xs text-muted">Desliza hacia la derecha para ver todas las columnas.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Desplazar tabla a la izquierda" onClick={() => tableScroll.current?.scrollBy({ left: -440, behavior: 'smooth' })} className={`${buttonClass} size-9 !h-9 !px-0`}><ArrowLeft className="size-4" aria-hidden="true" /></button>
            <button type="button" aria-label="Desplazar tabla a la derecha" onClick={() => tableScroll.current?.scrollBy({ left: 440, behavior: 'smooth' })} className={`${buttonClass} size-9 !h-9 !px-0`}><ArrowRight className="size-4" aria-hidden="true" /></button>
          </div>
        </div>
        <div ref={tableScroll} role="region" aria-label="Tabla de referidos" aria-describedby="records-scroll-hint" tabIndex={0} className={`${styles.scrollArea} focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand`}>
          <table className={`${styles.table} w-full table-fixed text-left text-sm`}>
            <colgroup>
              {[200, 120, 130, 240, 120, 200, 120, 180, 170, 170, 220, 90, 130, 200].map((width, i) => <col key={i} style={{ width }} />)}
            </colgroup>
            <thead className="bg-surface-muted text-[11px] font-black uppercase tracking-[0.12em] text-muted"><tr>
              {['Referido', 'Código', 'Teléfono', 'Correo', 'WhatsApp', 'Miembro ARIZ', 'Código miembro', 'Estado', 'Interés', 'Disponibilidad', 'Proyecto', 'Puntos', 'Registro', 'Acciones'].map(label => <th key={label} scope="col">{label}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-edge">
              {!data ? <tr><td colSpan={14} className="px-4 py-10 text-center text-muted">{error ? 'No se pudo cargar la lista.' : 'Cargando referidos...'}</td></tr> : !data.items.length ? <tr><td colSpan={14} className="px-4 py-10 text-center text-muted">No hay referidos con estos filtros.</td></tr> : data.items.map(row => (
                <tr key={row.id} className="group bg-surface transition-colors hover:bg-surface-muted/60">
                  <td title={row.name}><span className={styles.cellText}>{row.name}</span></td>
                  <td>{row.code}</td>
                  <td><a href={`tel:${row.phone.replace(/\s/g, '')}`}>{row.phone}</a></td>
                  <td title={row.email}><a className={styles.cellText} href={`mailto:${row.email}`}>{row.email}</a></td>
                  <td><a href={`https://wa.me/${row.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5"><MessageCircle className="size-3.5" />Contactar</a></td>
                  <td title={row.referrer.name}><Link href={ROUTES.panel.admin.referrer(row.referrer.id)} className={styles.cellText}>{row.referrer.name}</Link></td>
                  <td>{row.referrer.code}</td>
                  <td className="px-6 py-5"><span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${row.status === 'OPERATION_COMPLETED' ? 'bg-success/10 text-success' : row.status === 'REJECTED' ? 'bg-error/10 text-error' : 'bg-brand-soft text-brand'}`}>{row.statusLabel}</span></td>
                  <td title={row.interestLabel}><span className={styles.cellText}>{row.interestLabel}</span></td><td title={row.availabilityLabel}><span className={styles.cellText}>{row.availabilityLabel}</span></td>
                  <td title={row.project?.name}><span className={styles.cellText}>{row.project?.name ?? 'Sin proyecto'}</span></td>
                  <td className="px-6 py-5 font-black text-brand">{row.points.toLocaleString('es-PE')}</td>
                  <td className="px-6 py-5 text-xs text-muted">{new Date(row.createdAt).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })}</td>
                  <td className="px-6 py-5"><RecordActions id={row.id} name={row.name} points={row.points} onUpdated={load} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {data && data.total > 0 && <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-muted">Mostrando {(displayedPage - 1) * PAGE_SIZE + 1} al {Math.min(displayedPage * PAGE_SIZE, data.total)} de {data.total} referidos</p>
        <nav aria-label="Paginación de referidos" className="flex items-center gap-3">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className={buttonClass}>Anterior</button>
          <span className="text-sm font-semibold text-brand">Página {displayedPage} de {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className={buttonClass}>Siguiente</button>
        </nav>
      </div>}
    </div>
  );
}
