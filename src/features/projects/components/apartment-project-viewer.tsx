"use client";

import { useState } from "react";
import { SitePlanMap } from "@/shared/ui/site-plan-map";
import type { Point, SitePlan } from "@/shared/lib/site-plan";
import { APARTMENT_STATUS_COLORS, APARTMENT_STATUS_LABELS, buildingMapPlan, resolveFloorImage } from "@/shared/lib/apartment-plan";
import { ApartmentFloorCanvas } from "./apartment-floor-canvas";
import s from "./apartment-plan.module.css";

export function ApartmentProjectViewer({ plan, center, currency }: { plan: SitePlan; center: Point; currency: "PEN" | "USD" }) {
  const [buildingId, setBuildingId] = useState<string>();
  const [floorId, setFloorId] = useState<string>();
  const [unitId, setUnitId] = useState<string>();
  const [query, setQuery] = useState("");
  const building = plan.buildings?.find(b => b.id === buildingId) ?? plan.buildings?.[0];
  const floor = building?.floors.find(f => f.id === floorId) ?? building?.floors[0];
  const unit = floor?.apartments.find(a => a.id === unitId);
  const money = (value: number) => new Intl.NumberFormat("es-PE", { style: "currency", currency }).format(value);
  const selectBuilding = (id: string) => {
    if (!plan.buildings?.some(b => b.id === id)) return;
    setBuildingId(id); setFloorId(undefined); setUnitId(undefined); setQuery("");
  };
  if (!building) return null;
  const total = plan.buildings!.reduce((n, b) => n + b.floors.reduce((m, f) => m + f.apartments.length, 0), 0);
  return <section className={`${s.editor} my-9`} aria-label="Explorar edificios, pisos y departamentos">
    <header className={s.header}><div><h2>Encuentra tu departamento</h2><p className={s.muted}>Selecciona un edificio en el mapa y explora sus pisos. Cada departamento tiene su propia disponibilidad y precio.</p></div><div className={s.metrics}><span><strong>{plan.buildings!.length}</strong>Edificios</span><span><strong>{total}</strong>Departamentos</span></div></header>
    <div className={s.layout}>
      <div className={s.main}><SitePlanMap plan={buildingMapPlan(plan)} center={center} showImage={Boolean(plan.image)} selected={building.id} onSelect={selectBuilding} focusPlanRequest={1} legendStatuses={[]} legendAction={<span>Selecciona un edificio</span>} publicView />
        <div className={s.card}><h3>Disponibilidad</h3><div className={s.tabs}>{Object.entries(APARTMENT_STATUS_LABELS).map(([key, label]) => <span key={key} className={s.muted}><span className={s.dot} style={{ background: APARTMENT_STATUS_COLORS[key as keyof typeof APARTMENT_STATUS_COLORS] }} />{label}</span>)}</div></div>
      </div>
      <aside className={s.sidebar}>
        <section className={s.card}><h2>{building.name}</h2><div className={s.tabs}>{plan.buildings!.map(b => <button type="button" key={b.id} className={building.id === b.id ? s.active : ""} aria-pressed={building.id === b.id} onClick={() => selectBuilding(b.id)}>{b.name}</button>)}</div>
          <h3>Elige el piso</h3><div className={s.tabs}>{[...building.floors].sort((a, b) => a.number - b.number).map(f => <button type="button" key={f.id} className={floor?.id === f.id ? s.active : ""} aria-pressed={floor?.id === f.id} onClick={() => { setFloorId(f.id); setUnitId(undefined); setQuery(""); }}>{f.name}</button>)}</div>
          {floor && <><p className={s.muted}>{floor.name} · {floor.apartments.length} departamentos · {floor.apartments.filter(a => a.status === "AVAILABLE").length} disponibles</p><ApartmentFloorCanvas floor={{ ...floor, image: resolveFloorImage(plan, floor) }} selected={unitId} onSelect={setUnitId} compact />
            <div className={s.fields}><label>Buscar departamento<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Número, venta o alquiler" /></label></div>
            <div className={s.unitList}>{floor.apartments.filter(a => `${a.code} ${a.operation === "RENT" ? "alquiler" : "venta"}`.toLowerCase().includes(query.toLowerCase())).map(a => <button type="button" key={a.id} className={`${s.unitButton} ${unitId === a.id ? s.active : ""}`} onClick={() => setUnitId(a.id)}><span><strong>Dpto. {a.code}</strong><small>{a.areaM2} m² · {a.operation === "RENT" ? "Alquiler" : "Venta"}</small></span><span><strong>{money(a.price)}{a.operation === "RENT" ? "/mes" : ""}</strong><small>{APARTMENT_STATUS_LABELS[a.status]}</small></span></button>)}</div>
          </>}
        </section>
        {unit && <article className={s.card} aria-label={`Ficha del departamento ${unit.code}`}>
          <div className={s.floorHeader}><h2>Departamento {unit.code}</h2><button type="button" onClick={() => setUnitId(undefined)} aria-label="Cerrar ficha del departamento">Cerrar</button></div>
          <p className={s.muted}>{building.name} · {floor?.name}</p><p style={{ color: APARTMENT_STATUS_COLORS[unit.status], fontWeight: 750 }}>{APARTMENT_STATUS_LABELS[unit.status]}</p>
          <div className={s.metrics}><span><strong>{unit.areaM2} m²</strong>Área</span><span><strong>{unit.bedrooms}</strong>Dormitorios</span><span><strong>{unit.bathrooms}</strong>Baños</span></div>
          <div className={`${s.notice} mt-4`}><p>{unit.operation === "RENT" ? "Alquiler mensual" : "Precio de venta al contado"}</p><strong className="text-xl">{money(unit.price)}</strong></div>
          <p className="mt-3 text-sm">Mantenimiento: <strong>{money(unit.maintenanceFee)} / mes</strong></p>
          {unit.notes && <p className="mt-3 whitespace-pre-line text-sm">{unit.notes}</p>}
        </article>}
      </aside>
    </div>
  </section>;
}
