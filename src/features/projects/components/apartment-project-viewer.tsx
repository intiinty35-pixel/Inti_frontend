"use client";

import { ApartmentLocation } from "./apartment-location";
import { useState } from "react";
import { SitePlanMap } from "@/shared/ui/site-plan-map";
import type { Point, SitePlan } from "@/shared/lib/site-plan";
import { APARTMENT_STATUS_COLORS, APARTMENT_STATUS_LABELS, resolveFloorImage } from "@/shared/lib/apartment-plan";
import { floorApartmentMapPlan, floorBuildingOutline, geoToImage } from "@/shared/lib/plan-coordinates";
import { ApartmentFloorCanvas } from "./apartment-floor-canvas";
import { ProtectedLotPdfDownload } from "@/shared/ui/protected-lot-pdf-download";
import s from "./apartment-plan.module.css";

export function ApartmentProjectViewer({ plan, center, currency, slug, accessCode, embedded = false }: { plan: SitePlan; center: Point; currency: "PEN" | "USD"; slug: string; accessCode: string; embedded?: boolean }) {
  const [buildingId, setBuildingId] = useState<string>();
  const [floorId, setFloorId] = useState<string>();
  const [unitId, setUnitId] = useState<string>();
  const [query, setQuery] = useState("");
  const [view,setView]=useState<"FLOOR"|"MAP">("FLOOR");
  const building = plan.buildings?.find(b => b.id === buildingId) ?? plan.buildings?.[0];
  const floors = [...(building?.floors ?? [])].sort((a, b) => a.number - b.number);
  const floor = floors.find(f => f.id === floorId) ?? floors.find(f => f.number === 1) ?? floors[0];
  const unit = floor?.apartments.find(a => a.id === unitId);
  const selectUnit = (id: string) => {
    setUnitId(id);
    requestAnimationFrame(() => document.getElementById("public-apartment-detail")?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  };
  const money = (value: number) => new Intl.NumberFormat("es-BO", { style: "currency", currency }).format(value);
  const selectBuilding = (id: string) => {
    if (!plan.buildings?.some(b => b.id === id)) return;
    setBuildingId(id); setFloorId(undefined); setUnitId(undefined); setQuery("");
  };
  const buildings = plan.buildings ?? [];
  const geoPoints = buildings.flatMap(b => b.path);
  const west = Math.min(...geoPoints.map(p => p.lng)), east = Math.max(...geoPoints.map(p => p.lng));
  const south = Math.min(...geoPoints.map(p => p.lat)), north = Math.max(...geoPoints.map(p => p.lat));
  const overviewPoint = (p: Point) => plan.image ? geoToImage(p, plan.image) : { x: .05 + .9 * (p.lng - west) / Math.max(east - west, .000001), y: .05 + .9 * (north - p.lat) / Math.max(north - south, .000001) };
  const overviewHeight = plan.image ? 1000 * plan.image.heightM / plan.image.widthM : 650;
  if (!building) return <section className={`${s.card} my-8`}><p>No hay edificios disponibles en la versión publicada del plano.</p></section>;
  const total = plan.buildings!.reduce((n, b) => n + b.floors.reduce((m, f) => m + f.apartments.length, 0), 0);
  return <section className={`${s.editor} my-9`} aria-label="Explorar edificios, pisos y departamentos">
    <header className={s.header}><div><h2>Encuentra tu departamento</h2><p className={s.muted}>Elige una torre y un piso. Pasa el mouse sobre un departamento o haz clic para ver sus datos.</p></div><div className={s.metrics}><span><strong>{plan.buildings!.length}</strong>Edificios</span><span><strong>{total}</strong>Departamentos</span></div></header>
    <div className={s.layout} style={embedded ? { gridTemplateColumns: "minmax(0, 1fr)" } : undefined}>
      <div className={s.main}>
        <section className={s.card} aria-label="Plano general de las torres">
          <h3>Torres del proyecto</h3>
          <p className={s.muted}>Selecciona una torre para explorar sus pisos y departamentos.</p>
          <div className={s.canvas}><svg viewBox={`0 0 1000 ${overviewHeight}`} aria-label="Contornos de las torres">
            {plan.image && <svg width={1000} height={overviewHeight} viewBox={plan.image.crop ? `${plan.image.crop.left * 1000} ${plan.image.crop.top * overviewHeight} ${(plan.image.crop.right-plan.image.crop.left)*1000} ${(plan.image.crop.bottom-plan.image.crop.top)*overviewHeight}` : `0 0 1000 ${overviewHeight}`} preserveAspectRatio="none" pointerEvents="none"><image href={plan.image.url} width={1000} height={overviewHeight} preserveAspectRatio="none"/></svg>}
            {buildings.filter(b => b.path.length >= 3).map(b => {
              const points = b.path.map(overviewPoint);
              const x = points.reduce((sum,p) => sum+p.x,0)/points.length*1000;
              const y = points.reduce((sum,p) => sum+p.y,0)/points.length*overviewHeight;
              return <g key={b.id} role="button" tabIndex={0} aria-label={`Ver ${b.name}`} aria-pressed={building.id===b.id} style={{cursor:"pointer"}} onClick={()=>selectBuilding(b.id)} onKeyDown={event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();selectBuilding(b.id);}}}>
                <polygon points={points.map(p=>`${p.x*1000},${p.y*overviewHeight}`).join(" ")} fill={building.id===b.id?"#e0a21b":"#0b3d91"} fillOpacity={.22} stroke={building.id===b.id?"#a77713":"#0b3d91"} strokeWidth={3} vectorEffect="non-scaling-stroke"/>
                <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={18} fontWeight={750} fill="#0b3d91" stroke="white" strokeWidth={4} paintOrder="stroke" pointerEvents="none">{b.name}</text>
              </g>;
            })}
          </svg></div>
        </section>
        <section className={s.card}>
          <div className={s.floorHeader}><h3>{building.name}{floor?` · ${floor.name}`:""}</h3><div className={s.tabs} role="group" aria-label="Vista del proyecto"><button type="button" aria-pressed={view==="FLOOR"} className={view==="FLOOR"?s.active:undefined} onClick={()=>setView("FLOOR")}>Departamentos del piso</button><button type="button" aria-pressed={view==="MAP"} className={view==="MAP"?s.active:undefined} onClick={()=>setView("MAP")}>Ubicación en Google Maps</button></div></div>
          <div className={s.tabs} role="group" aria-label="Elegir torre">{plan.buildings!.map(b=><button key={b.id} type="button" aria-pressed={building.id===b.id} className={building.id===b.id?s.active:undefined} onClick={()=>selectBuilding(b.id)}>{b.name}</button>)}</div>
          <div className={s.tabs} role="group" aria-label="Elegir piso">{[...building.floors].sort((a,b)=>a.number-b.number).map(f=><button key={f.id} type="button" aria-pressed={floor?.id===f.id} className={floor?.id===f.id?s.active:undefined} onClick={()=>{setFloorId(f.id);setUnitId(undefined);setQuery("");}}>{f.name}</button>)}</div>
          {view==="FLOOR" ? floor ? <ApartmentFloorCanvas key={`${building.id}:${floor.id}`} publicView outline={floorBuildingOutline(plan,building,floor)} currency={currency} floor={{...floor,image:resolveFloorImage(plan,floor)}} selected={unitId} onSelect={selectUnit}/> : <p className={s.empty}>Esta torre aún no tiene pisos publicados.</p> : <SitePlanMap plan={floorApartmentMapPlan(plan,building,floor)} center={center} showImage={Boolean(plan.image)} selected={unitId ?? building.id} onSelect={id=>{if(floor?.apartments.some(a=>a.id===id))selectUnit(id);else selectBuilding(id);}} currency={currency} lotSummary={lot=>{const apartment=floor?.apartments.find(a=>a.id===lot.id);return {title:`Departamento ${lot.code}`,price:money(lot.price)+(apartment?.operation==="RENT"?"/mes":""),priceM2:undefined,detail:`${lot.areaM2} m² · ${apartment?APARTMENT_STATUS_LABELS[apartment.status]:""}`};}} focusPlanZoom={20} focusPlanRequest={1001+(plan.buildings?.findIndex(b=>b.id===building.id)??0)*1000+(floor?.number??0)} legendStatuses={[]} legendAction={<span>Pasa el mouse o selecciona un departamento</span>} publicView/>}
        </section>
        {unit && floor && <ApartmentLocation key={unit.id} plan={plan} building={building} floor={floor} unit={unit} />}
        <div className={s.card}><h3>Disponibilidad</h3><div className={s.tabs}>{Object.entries(APARTMENT_STATUS_LABELS).map(([key, label]) => <span key={key} className={s.muted}><span className={s.dot} style={{ background: APARTMENT_STATUS_COLORS[key as keyof typeof APARTMENT_STATUS_COLORS] }} />{label}</span>)}</div></div>
      </div>
      <aside className={s.sidebar}>
        <section className={s.card}><h2>{building.name}</h2><div className={s.tabs}>{plan.buildings!.map(b => <button type="button" key={b.id} className={building.id === b.id ? s.active : ""} aria-pressed={building.id === b.id} onClick={() => selectBuilding(b.id)}>{b.name}</button>)}</div>
          <h3>Elige el piso</h3><div className={s.tabs}>{[...building.floors].sort((a, b) => a.number - b.number).map(f => <button type="button" key={f.id} className={floor?.id === f.id ? s.active : ""} aria-pressed={floor?.id === f.id} onClick={() => { setFloorId(f.id); setUnitId(undefined); setQuery(""); }}>{f.name}</button>)}</div>
          {floor && <><p className={s.muted}>{floor.name} · {floor.apartments.length} departamentos · {floor.apartments.filter(a => a.status === "AVAILABLE").length} disponibles</p>
            <div className={s.fields}><label>Buscar departamento<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Número, venta o alquiler" /></label></div>
            <div className={s.unitList}>{floor.apartments.filter(a => `${a.code} ${a.operation === "RENT" ? "alquiler" : "venta"}`.toLowerCase().includes(query.toLowerCase())).map(a => <button type="button" key={a.id} className={`${s.unitButton} ${unitId === a.id ? s.active : ""}`} onClick={() => selectUnit(a.id)}><span><strong>Dpto. {a.code}</strong><small>{a.areaM2} m² · {a.operation === "RENT" ? "Alquiler" : "Venta"}</small></span><span><strong>{money(a.price)}{a.operation === "RENT" ? "/mes" : ""}</strong><small>{APARTMENT_STATUS_LABELS[a.status]}</small></span></button>)}</div>
          </>}
        </section>
        {unit && <article id="public-apartment-detail" className={s.card} aria-label={`Ficha del departamento ${unit.code}`}>
          <p className={s.sheetKicker}>Tu próximo espacio</p>
          <div className={s.floorHeader}><h2>Departamento {unit.code}</h2><button type="button" onClick={() => setUnitId(undefined)} aria-label="Cerrar ficha del departamento">Cerrar</button></div>
          <p className={s.muted}>{building.name} · {floor?.name}</p><p style={{ color: APARTMENT_STATUS_COLORS[unit.status], fontWeight: 750 }}>{APARTMENT_STATUS_LABELS[unit.status]}</p>
          <div className={s.metrics}><span><strong>{unit.areaM2} m²</strong>Área</span><span><strong>{unit.bedrooms}</strong>Dormitorios</span><span><strong>{unit.bathrooms}</strong>Baños</span></div>
          <div className={`${s.notice} mt-4`}><p>{unit.operation === "RENT" ? "Alquiler mensual" : "Precio de venta al contado"}</p><strong className="text-xl">{money(unit.price)}</strong></div>
          <p className="mt-3 text-sm">Mantenimiento: <strong>{money(unit.maintenanceFee)} / mes</strong></p>
          {unit.operation === "SALE" && unit.financingAllowed && <div className={s.notice}>
            <p>Precio al crédito: <strong>{money(unit.financedPrice ?? 0)}</strong></p>
            <p>Inicial: {money(unit.downPayment ?? 0)}</p>
            <p>{unit.installments} cuotas mensuales de {money(unit.monthlyPayment ?? 0)}</p>
            <p>{unit.interestRateMonthly ? `Interés mensual: ${unit.interestRateMonthly}%` : "Sin interés"}</p>
            <p>Saldo a financiar: {money(Math.max(0, (unit.financedPrice ?? 0) - (unit.downPayment ?? 0)))}</p>
            <p>Total de cuotas: {money((unit.installments ?? 0) * (unit.monthlyPayment ?? 0))}</p>
            <p>Total a pagar: {money((unit.downPayment ?? 0) + (unit.installments ?? 0) * (unit.monthlyPayment ?? 0))}</p>
            <p className={s.muted}>La última cuota puede ajustarse por redondeo.</p>
          </div>}
          {unit.notes && <p className="mt-3 whitespace-pre-line text-sm">{unit.notes}</p>}
          <div className={s.sheetDownload}><ProtectedLotPdfDownload key={unit.id} slug={slug} lotId={unit.id} code={accessCode} unitType="apartment" className={s.primary} /></div>
        </article>}
      </aside>
    </div>
  </section>;
}
