"use client";

import { useId, useState } from "react";
import { ArrowUpRight, Banknote, Calculator, CalendarDays, ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";
import type { PlanLot } from "@/shared/lib/site-plan";
import { findBudgetLots, lotBudgetAmount, type LotBudgetFilter } from "@/shared/lib/lot-budget";
import { formatPrice } from "@/shared/lib/format";
import s from "./lot-budget-finder.module.css";

const PAGE_SIZE = 10;

export function LotBudgetFinder({ lots, currency, filter, onChange, onSelect }: {
  lots: PlanLot[];
  currency: string;
  filter: LotBudgetFilter | null;
  onChange: (filter: LotBudgetFilter | null) => void;
  onSelect: (id: string) => void;
}) {
  const id = useId();
  const [page, setPage] = useState(0);
  const current = filter ?? { mode: "CASH", amount: "" };
  const financed = current.mode === "FINANCED";
  const result = findBudgetLots(lots, current);
  const entries = [...result.matches.map(lot => ({ lot, nearby: false })), ...result.nearby.map(lot => ({ lot, nearby: true }))];
  const pages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages - 1);
  const start = currentPage * PAGE_SIZE;
  const visible = entries.slice(start, start + PAGE_SIZE);
  const money = (amount: number) => formatPrice(amount, currency);
  function update(next: LotBudgetFilter) { setPage(0); onChange(next); }

  function renderLot(lot: PlanLot, nearby = false) {
    return <button type="button" key={lot.id} className={s.result} onClick={() => onSelect(lot.id)}>
      <span><strong>Lote {lot.code}{lot.block ? ` · Mz. ${lot.block}` : ""}</strong>
        <small>{lot.areaM2} m²{nearby ? ` · ${money(lotBudgetAmount(lot, current.mode) - Number(current.amount))} sobre tu monto` : " · Disponible"}</small>
        {financed && <small>Inicial {money(lot.downPayment)}{lot.installments > 0 ? ` · ${lot.installments} cuotas` : ""}</small>}
      </span>
      <span className={s.resultPrice}>{money(lotBudgetAmount(lot, current.mode))}{financed && <small>/ mes</small>}<ArrowUpRight size={14} aria-hidden="true" /></span>
    </button>;
  }

  return <section className={s.finder} aria-labelledby={`${id}-title`}>
    <div className={s.eyebrow}><Calculator size={13} aria-hidden="true" /> Buscador de lotes</div>
    <h2 id={`${id}-title`}>Un lote a tu medida</h2>
    <p className={s.description}>Encuentra opciones según tu presupuesto y forma de pago.</p>
    <div className={s.modes} role="group" aria-label="Forma de pago">
      <button type="button" aria-pressed={!financed} onClick={() => update({ mode: "CASH", amount: financed ? "" : current.amount })}><Banknote size={15} aria-hidden="true" />Al contado</button>
      <button type="button" aria-pressed={financed} onClick={() => update({ mode: "FINANCED", amount: financed ? current.amount : "" })}><CalendarDays size={15} aria-hidden="true" />Financiado</button>
    </div>
    <label className={s.amountLabel} htmlFor={`${id}-amount`}>{financed ? "¿Cuánto puedes pagar al mes?" : "Tu presupuesto total"}</label>
    <div className={s.amount}>
      <span aria-hidden="true">{currency === "PEN" ? "S/" : currency === "USD" ? "$" : currency}</span>
      <input id={`${id}-amount`} type="number" inputMode="decimal" min="0" step="any" placeholder="Ingresa un monto"
        value={current.amount} onChange={event => update({ ...current, amount: event.target.value })}
        aria-describedby={`${id}-help`} />
      {filter && <button type="button" aria-label="Limpiar filtros de presupuesto" onClick={() => { setPage(0); onChange(null); }}><X size={15} /></button>}
    </div>
    <p id={`${id}-help`} className={s.help}>{financed ? "Comparamos las cuotas publicadas. Cada lote tiene su propia inicial y plazo." : "Mostramos lotes disponibles hasta tu monto y opciones cercanas hasta un 10 % más."}</p>
    {result.cheapest && <button type="button" className={s.cheapest} onClick={() => onSelect(result.cheapest!.id)}>
      <span className={s.spark}><Sparkles size={18} aria-hidden="true" /></span>
      <span><small>{financed ? "La cuota más baja" : "El lote más económico"}</small><strong>Desde {money(lotBudgetAmount(result.cheapest, current.mode))}{financed ? " / mes" : ""}</strong></span>
      <ArrowUpRight size={16} aria-hidden="true" />
    </button>}
    <div className={s.resultsHeading}><strong>{result.hasBudget ? "Resultados de tu búsqueda" : "Opciones disponibles"}</strong><span>{entries.length} lotes</span></div>
    {result.hasBudget && <p className={s.help}>{result.matches.length} dentro de tu presupuesto{result.nearby.length ? ` · ${result.nearby.length} opciones cercanas` : ""}</p>}
    {visible.map((entry, index) => <div key={entry.lot.id}>
      {entry.nearby && (index === 0 || !visible[index - 1].nearby) && <div className={s.nearbyHeading}>Por un poco más <span>Hasta +10 %</span></div>}
      {renderLot(entry.lot, entry.nearby)}
    </div>)}
    {!entries.length && <p className={s.empty}>{result.cheapest ? "No hay lotes cercanos a ese monto. Puedes ajustar tu presupuesto." : `No hay lotes disponibles con ${financed ? "cuotas publicadas" : "precio al contado"}.`}</p>}
    {entries.length > 0 && <nav className={s.pagination} aria-label="Páginas de lotes por presupuesto">
      <span role="status">{start + 1}–{Math.min(start + PAGE_SIZE, entries.length)} de {entries.length}</span>
      <div>
        <button type="button" aria-label="Página anterior de lotes" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={15} /></button>
        <span>{currentPage + 1} / {pages}</span>
        <button type="button" aria-label="Página siguiente de lotes" disabled={currentPage === pages - 1} onClick={() => setPage(currentPage + 1)}><ChevronRight size={15} /></button>
      </div>
    </nav>}
  </section>;
}
