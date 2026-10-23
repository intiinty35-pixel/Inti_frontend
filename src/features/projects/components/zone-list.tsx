"use client";

import { useId, useState } from "react";
import { ChevronLeft, ChevronRight, Grid2X2, Route, Scan, Search, SlidersHorizontal, Trees, X } from "lucide-react";
import type { PlanLot, PlanZone } from "@/shared/lib/site-plan";
import s from "./site-plan.module.css";

const PAGE_SIZE = 6;
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().trim();

const categories = {
  STREET: { title: "Calles", singular: "calle", icon: Route },
  PARK: { title: "Parques", singular: "parque", icon: Trees },
  CONTOUR: { title: "Contornos", singular: "contorno", icon: Scan },
  BLOCK: { title: "Manzanas", singular: "manzana", icon: Grid2X2 },
};

export function ZoneList({ zones, kind, lots = [], selected, onSelect }: {
  zones: PlanZone[];
  kind: PlanZone["kind"];
  lots?: PlanLot[];
  selected?: string;
  onSelect: (id: string) => void;
}) {
  const id = useId();
  const [filterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const category = categories[kind];
  const Icon = category.icon;
  const items = zones.filter(zone => zone.kind === kind)
    .sort((a, b) => a.name.localeCompare(b.name, "es", { numeric: true, sensitivity: "base" }));
  const filtered = items.filter(zone => normalize(zone.name).includes(normalize(query)));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages - 1);
  const start = currentPage * PAGE_SIZE;

  return <div className={s.streetDirectory}>
    <div className={s.streetHeading}>
      <h2>{category.title} <span>{items.length}</span></h2>
      <button type="button" aria-expanded={filterOpen} aria-controls={`${id}-filter`}
        className={s.streetFilterButton} data-active={filterOpen || undefined}
        onClick={() => { setFilterOpen(!filterOpen); if (filterOpen) { setQuery(""); setPage(0); } }}>
        <SlidersHorizontal size={14} aria-hidden="true" /> Filtrar
      </button>
    </div>
    {filterOpen && <div id={`${id}-filter`} className={s.streetSearch}>
      <Search size={15} aria-hidden="true" />
      <input type="search" aria-label={`Buscar ${category.singular} por nombre`} placeholder={`Buscar ${category.singular}…`} value={query}
        onChange={event => { setQuery(event.target.value); setPage(0); }} />
      {query && <button type="button" aria-label="Limpiar búsqueda" onClick={() => { setQuery(""); setPage(0); }}><X size={14} /></button>}
    </div>}
    <div className={s.streetGrid}>
      {filtered.slice(start, start + PAGE_SIZE).map(zone => <button key={zone.id} type="button"
        className={s.streetTile} aria-pressed={selected === zone.id} onClick={() => onSelect(zone.id)}>
        <Icon size={17} aria-hidden="true" />
        <span title={zone.name}>{zone.name}<small>{kind === "BLOCK" ? `${lots.filter(lot => lot.block === zone.name).length} lotes` : "Editar trazado"}</small></span>
      </button>)}
    </div>
    {!filtered.length && <p className={s.muted}>{items.length ? "No hay coincidencias con ese nombre." : `No hay ${category.title.toLocaleLowerCase()} en este borrador.`}</p>}
    {filtered.length > 0 && <div className={s.streetPagination}>
      <span role="status">{start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)} de {filtered.length}</span>
      {pages > 1 && <div>
        <button type="button" aria-label={`Página anterior de ${category.title.toLocaleLowerCase()}`} disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={15} /></button>
        <span>{currentPage + 1} / {pages}</span>
        <button type="button" aria-label={`Página siguiente de ${category.title.toLocaleLowerCase()}`} disabled={currentPage === pages - 1} onClick={() => setPage(currentPage + 1)}><ChevronRight size={15} /></button>
      </div>}
    </div>}
  </div>;
}
