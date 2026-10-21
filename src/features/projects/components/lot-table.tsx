"use client";

import { useState } from 'react';
import { LOT_LABELS, type PlanLot, type SitePlan } from '@/shared/lib/site-plan';
import s from './site-plan.module.css';

export function LotTable({ plan, project, exportUrl, onClose, onEdit, onDelete }: {
  plan: SitePlan; project: { name: string; currency: string }; exportUrl: string;
  onClose: () => void; onEdit: (id: string) => void; onDelete: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
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
  return <section className={s.lotBook} aria-labelledby="lot-table-title">
    <h2 id="lot-table-title" className="mb-3 text-lg font-bold">Lotes del proyecto · {project.name}</h2>
    <div className={s.lotTableTools}>
      <span>{rows.length} de {drawnLots.length} lotes</span>
      <input aria-label="Buscar lotes" placeholder="Buscar lote…" value={query} onChange={e => setQuery(e.target.value)} />
      <select aria-label="Filtrar por estado" value={status} onChange={e => setStatus(e.target.value)}><option value="">Todos los estados</option>{Object.entries(LOT_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
      <button type="button" disabled={busy || !rows.length} onClick={() => download('xlsx')}>Descargar Excel</button>
      <button type="button" disabled={busy || !rows.length} onClick={() => download('pdf')}>Descargar PDF</button>
      <button type="button" disabled={busy} onClick={onClose}>Cerrar</button>
    </div>
    {error && <p role="alert" className="mb-3 text-red-600">{error}</p>}
    <div className="max-h-[65dvh] overflow-auto rounded-xl border border-slate-200"><table className="w-full border-collapse text-left text-xs"><thead className="sticky top-0 bg-slate-700 text-white"><tr>{['N.º de lote', 'Manzana', 'Dirección', 'Tipo', 'Área m²', 'Perímetro m', 'Dimensiones', 'Frente m', 'Precio m²', 'Precio de venta', 'Estado', 'Pago', 'Acciones'].map(h => <th key={h} className="whitespace-nowrap px-3 py-4">{h}</th>)}</tr></thead><tbody>{rows.map(l => <tr key={l.id} className="border-b border-slate-200 even:bg-slate-50">
      {[l.code, l.block, l.address || l.street, l.type, l.areaM2, l.perimeterM, l.dimensions, l.frontM, money(l.priceM2), money(salePrice(l)), LOT_LABELS[l.status], [l.cashAllowed && 'Contado', l.financingAllowed && 'Financiado'].filter(Boolean).join(' / ')].map((cell, i) => <td key={i} className="px-3 py-3">{cell || '—'}</td>)}
      <td className="whitespace-nowrap px-3 py-3"><button type="button" disabled={busy} aria-label={`Editar ${l.code}`} onClick={() => { onClose(); onEdit(l.id); }}>Editar</button> <button type="button" disabled={busy} aria-label={`Eliminar ${l.code}`} onClick={() => { if (window.confirm(`¿Eliminar el lote ${l.code}?`)) onDelete(l.id); }}>Eliminar</button></td>
    </tr>)}</tbody></table>{!rows.length && <p className="p-8 text-center text-sm text-slate-500">No hay lotes para mostrar.</p>}</div>
  </section>;
}
