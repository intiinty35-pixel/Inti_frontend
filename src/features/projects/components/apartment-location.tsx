"use client";

import { useState } from "react";
import type { SitePlan } from "@/shared/lib/site-plan";
import { resolveFloorImage, type PlanApartment, type PlanBuilding, type PlanFloor } from "@/shared/lib/apartment-plan";
import { geoToImage } from "@/shared/lib/plan-coordinates";
import s from "./apartment-plan.module.css";

export function ApartmentLocation({ plan, building, floor, unit }: { plan: SitePlan; building: PlanBuilding; floor: PlanFloor; unit: PlanApartment }) {
  const [zoom, setZoom] = useState(1);
  const image = resolveFloorImage(plan, floor);
  const aspect = image ? image.height / image.width : .7;
  const crop = image?.crop ?? { left: 0, top: 0, right: 1, bottom: 1 };
  const height = 1000 * aspect;
  const points = unit.path;
  const left = Math.min(...points.map(p => p.x)), right = Math.max(...points.map(p => p.x));
  const top = Math.min(...points.map(p => p.y)), bottom = Math.max(...points.map(p => p.y));
  const width = Math.max(right - left, .04) * 1.8 / zoom;
  const h = Math.max(bottom - top, .04) * 1.8 / zoom;
  const viewBox = `${((left + right) / 2 - width / 2) * 1000} ${((top + bottom) / 2 - h / 2) * height} ${width * 1000} ${h * height}`;
  const all = (plan.buildings ?? []).flatMap(b => b.path);
  const west = Math.min(...all.map(p => p.lng)), east = Math.max(...all.map(p => p.lng));
  const south = Math.min(...all.map(p => p.lat)), north = Math.max(...all.map(p => p.lat));
  const overviewHeight = plan.image ? 1000 * plan.image.heightM / plan.image.widthM : 700;
  const projectPoint = (p: { lat: number; lng: number }) => plan.image ? geoToImage(p, plan.image) : { x: .05 + .9 * (p.lng - west) / Math.max(east - west, .000001), y: .05 + .9 * (north - p.lat) / Math.max(north - south, .000001) };
  return <section className={s.location} aria-label="Ubicación del departamento en el plano">
    <div className={s.locationHeader}><div><h3>Ubicación en plano</h3><p>{building.name} · {floor.name} · Departamento {unit.code}</p></div><label>Zoom {Math.round(zoom * 100)}%<input aria-label="Zoom al departamento" type="range" min={1} max={3} step={.1} value={zoom} onChange={e => setZoom(Number(e.target.value))} /></label></div>
    <div className={s.locationGrid}>
      <figure><svg viewBox={`0 0 1000 ${overviewHeight}`} role="img" aria-label={`Proyecto completo con ${building.name} resaltado`}>
        {plan.image && <svg width={1000} height={overviewHeight} viewBox={plan.image.crop ? `${plan.image.crop.left * 1000} ${plan.image.crop.top * overviewHeight} ${(plan.image.crop.right-plan.image.crop.left)*1000} ${(plan.image.crop.bottom-plan.image.crop.top)*overviewHeight}` : `0 0 1000 ${overviewHeight}`} preserveAspectRatio="none"><image href={plan.image.url} width={1000} height={overviewHeight} preserveAspectRatio="none" /></svg>}
        {(plan.buildings ?? []).map(b => <polygon key={b.id} points={b.path.map(projectPoint).map(p => `${p.x * 1000},${p.y * overviewHeight}`).join(" ")} fill={b.id === building.id ? "#d49a19" : "#2563eb"} fillOpacity={b.id === building.id ? .3 : .08} stroke={b.id === building.id ? "#dc2626" : "#64748b"} strokeWidth={b.id === building.id ? 3 : 1} vectorEffect="non-scaling-stroke" />)}
      </svg><figcaption>Proyecto completo · {building.name}</figcaption></figure>
      <figure><svg viewBox={viewBox} role="img" aria-label={`Ampliación del departamento ${unit.code}`}>
        {image && <svg width={1000} height={height} viewBox={`${crop.left * 1000} ${crop.top * height} ${(crop.right-crop.left)*1000} ${(crop.bottom-crop.top)*height}`} preserveAspectRatio="none"><image href={image.url} width={1000} height={height} preserveAspectRatio="none" /></svg>}
        {floor.apartments.map(a => <polygon key={a.id} points={a.path.map(p => `${p.x * 1000},${p.y * height}`).join(" ")} fill={a.id === unit.id ? "#d49a19" : "#2563eb"} fillOpacity={a.id === unit.id ? .3 : .07} stroke={a.id === unit.id ? "#dc2626" : "#64748b"} strokeWidth={a.id === unit.id ? 3 : 1} vectorEffect="non-scaling-stroke" />)}
        <text x={(left + right) / 2 * 1000} y={(top + bottom) / 2 * height} textAnchor="middle" dominantBaseline="middle" fontSize={Math.min(width * 1000 / 8, 28)} fontWeight={750} fill="#122b50" stroke="white" strokeWidth={4} paintOrder="stroke">Dpto. {unit.code}</text>
      </svg><figcaption>Zoom al departamento {unit.code} · {floor.name}</figcaption></figure>
    </div>
  </section>;
}
