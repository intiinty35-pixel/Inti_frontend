"use client";

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { Pencil, Trash2 } from 'lucide-react';
import { LOT_LABELS, type PlanLot, type SitePlan } from '@/shared/lib/site-plan';
import s from './site-plan.module.css';
import ui from './lot-inventory.module.css';
import { MapFilterSelect } from '@/features/listings/components/map-filter-select';

export function LotTable({ plan, project, exportUrl, onClose, onEdit, onDelete }: {
  plan: SitePlan; project: { name: string; currency: string }; exportUrl: string;
  onClose: () => void; onEdit: (id: string) => void; onDelete: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [deleteLot, setDeleteLot] = useState<PlanLot | null>(null);
  const drawnLots = plan.lots.filter(l => l.path.length >= 3);
  const rows = drawnLots.filter(l => (!status || l.status === status) && `${l.code} ${l.block} ${l.street} ${l.address} ${l.type} ${LOT_LABELS[l.status]}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const money = (n: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: project.currency }).format(n);
  async function download(format: 'xlsx' | 'pdf') {
    setBusy(true); setError('');
    try {
      const response = await fetch(`${exportUrl}/${format}`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...plan, lots: rows }) });
      if (!response.ok) throw new Error('No se pudo descargar el listado');
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a'); link.href = url; link.download = `lotes-${project.name.replace(/[^\p{L}\p{N}-]/gu, '-')}.${format}`; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo descargar'); }
    finally { setBusy(false); }
  }
  const salePrice = (l: PlanLot) => l.cashAllowed ? l.price : l.financedPrice;
  const counts = { total: drawnLots.length, available: drawnLots.filter(l => l.status === 'AVAILABLE').length, reserved: drawnLots.filter(l => l.status === 'RESERVED').length, sold: drawnLots.filter(l => l.status === 'SOLD').length };
  const progress = counts.total ? Math.round(counts.sold / counts.total * 100) : 0;
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visibleRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  return <section className={`${s.lotBook} ${ui.inventory}`} aria-labelledby="lot-table-title">
    <header className={ui.hero}><p className={ui.eyebrow}>Lotes / {project.name}</p><span className={ui.pill}>Inventario de lotes</span><h1>{project.name}</h1><div className={ui.metrics}>{[[counts.total, 'Total'], [counts.available, 'Disponibles'], [counts.reserved, 'Separados'], [counts.sold, 'Vendidos']].map(([count, label]) => <div key={label}><strong>{count}</strong><span>{label}</span></div>)}<div className={ui.progress}><span>Avance de ventas <strong>{progress}%</strong></span><progress value={progress} max={100} aria-label="Avance de ventas" /></div></div></header>
    <h2 id="lot-table-title" className="mb-3 text-lg font-bold">Lotes del proyecto · {project.name}</h2>
    <div className={`${s.lotTableTools} ${ui.tools}`}>
      <span>{rows.length} de {drawnLots.length} lotes</span>
      <input aria-label="Buscar lotes" placeholder="Buscar lote…" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} />
      <MapFilterSelect compact label="Estado" value={status} onChange={value => { setStatus(value); setPage(1); }} options={[{ value: '', label: 'Todos los estados' }, ...Object.entries(LOT_LABELS).map(([value, label]) => ({ value, label }))]} />
      <MapFilterSelect compact label="Lotes por página" value={String(pageSize)} onChange={value => { setPageSize(Number(value)); setPage(1); }} options={[15, 30, 50].map(value => ({ value: String(value), label: `${value} por página` }))} />
      <button type="button" disabled={busy || !rows.length} onClick={() => download('xlsx')}>Descargar Excel</button>
      <button type="button" disabled={busy || !rows.length} onClick={() => download('pdf')}>Descargar PDF</button>
      <button type="button" disabled={busy} onClick={onClose}>Volver al plano</button>
    </div>
    {error && <p role="alert" className="mb-3 text-red-600">{error}</p>}
    <div className={`${ui.tableScroll} max-h-[65dvh] rounded-xl border border-slate-200`} role="region" aria-label="Listado de lotes" tabIndex={0}><table className="w-full border-collapse text-left text-xs"><thead className="sticky top-0 bg-slate-700 text-white"><tr>{['N.º de lote', 'Manzana', 'Dirección', 'Tipo', 'Área m²', 'Perímetro m', 'Dimensiones', 'Frente m', 'Precio m²', 'Precio de venta', 'Estado', 'Pago', 'Acciones'].map(h => <th key={h} className="whitespace-nowrap px-3 py-4">{h}</th>)}</tr></thead><tbody>{visibleRows.map(l => <tr key={l.id} className="border-b border-slate-200 even:bg-slate-50">
      {[l.code, l.block, l.address || l.street, l.type, l.areaM2, l.perimeterM, l.dimensions, l.frontM, money(l.priceM2), money(salePrice(l)), LOT_LABELS[l.status], [l.cashAllowed && 'Contado', l.financingAllowed && 'Financiado'].filter(Boolean).join(' / ')].map((cell, i) => <td key={i} className="px-3 py-3">{cell || '—'}</td>)}
      <td className="whitespace-nowrap px-3 py-3"><button type="button" disabled={busy} title="Editar lote" aria-label={`Editar ${l.code}`} onClick={() => { onClose(); onEdit(l.id); }}><Pencil size={16} aria-hidden="true" /></button> <button type="button" disabled={busy} title="Eliminar lote" aria-label={`Eliminar ${l.code}`} onClick={() => setDeleteLot(l)}><Trash2 size={16} aria-hidden="true" /></button></td>
    </tr>)}</tbody></table>{!rows.length && <p className="p-8 text-center text-sm text-slate-500">No hay lotes para mostrar.</p>}</div>
    <footer className={ui.pagination}><span>{rows.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, rows.length)} de {rows.length} lotes</span><button type="button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Anterior</button><span>{currentPage} / {pages}</span><button type="button" disabled={currentPage >= pages} onClick={() => setPage(currentPage + 1)}>Siguiente</button></footer>
    {deleteLot && createPortal(
      <ConfirmDialog
        open
        title={`Eliminar lote ${deleteLot.code}`}
        description="Se quitará este lote del plano. Guarda los cambios del proyecto para confirmar la eliminación."
        confirmLabel="Eliminar lote"
        variant="danger"
        onCancel={() => setDeleteLot(null)}
        onConfirm={() => { onDelete(deleteLot.id); setDeleteLot(null); }}
      />,
      document.body,
    )}
  </section>;
}
