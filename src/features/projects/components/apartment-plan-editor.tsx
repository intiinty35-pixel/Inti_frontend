"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, Copy, Eye, EyeOff, Plus, Save, Upload } from "lucide-react";
import { env } from "@/shared/lib/env";
import { uploadImageToCloudinary, uploadToCloudinary, PROJECT_MEDIA_FOLDER } from "@/shared/lib/api/cloudinary";
import { SitePlanMap } from "@/shared/ui/site-plan-map";
import { SitePlanCanvas } from "@/shared/ui/site-plan-canvas";
import { cropPlan, floorBuildingOutline, geoToImage, imageToGeo, placeImageAnchor, recalibratePlan, resizePlanDrawing, restorePlanCrop } from "@/shared/lib/plan-coordinates";
import { polygonMetrics, type PlanImage, type PlanSession, type Point, type SitePlan } from "@/shared/lib/site-plan";
import { APARTMENT_STATUS_LABELS, APARTMENT_STATUS_COLORS, apartmentCode, alignFloorApartments, duplicateApartment, buildingMapPlan, duplicateFloor, floorPolygonValid, resolveFloorImage, type FloorPoint, type PlanApartment, type PlanBuilding, type PlanFloor } from "@/shared/lib/apartment-plan";
import { ApartmentFloorCanvas } from "./apartment-floor-canvas";
import { PdfPlanImport } from "./pdf-plan-import";
import s from "./apartment-plan.module.css";

export function ApartmentPlanEditor({ initial }: { initial: PlanSession }) {
  const [plan, setPlan] = useState<SitePlan>({ ...initial.plan, mode: "APARTMENTS", buildings: initial.plan.buildings ?? [] });
  const [revision, setRevision] = useState(initial.revision);
  const [publishedAt, setPublishedAt] = useState(initial.publishedAt);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [buildingId, setBuildingId] = useState<string>();
  const [floorId, setFloorId] = useState<string>();
  const [unitId, setUnitId] = useState<string>();
  const [drawingBuilding, setDrawingBuilding] = useState(false);
  const [buildingName, setBuildingName] = useState("");
  const [footprint, setFootprint] = useState<Point[]>([]);
  const [drawingUnit, setDrawingUnit] = useState(false);
  const [showFloorImage, setShowFloorImage] = useState(true);
  const [alignment, setAlignment] = useState<{ source: PlanFloor; apartments: PlanApartment[] }>();
  const [points, setPoints] = useState<FloorPoint[]>([]);
  const [pdfFile, setPdfFile] = useState<{ file: File; target: "GENERAL" | "FLOOR" }>();
  const [showGeneralImage, setShowGeneralImage] = useState(true);
  const [view, setView] = useState<"PLAN" | "MAP">(initial.plan.image ? "PLAN" : "MAP");
  const [moveGeneral, setMoveGeneral] = useState(false);
  const [alignImageOnly, setAlignImageOnly] = useState(false);
  const [moveDrawingOnSheet, setMoveDrawingOnSheet] = useState(false);
  const [drawingUndo, setDrawingUndo] = useState<SitePlan[]>([]);
  const [editingFootprint, setEditingFootprint] = useState(false);
  const [focusRequest, setFocusRequest] = useState(0);
  const buildings = plan.buildings ?? [];
  const building = buildings.find(b => b.id === buildingId) ?? buildings[0];
  const floor = building?.floors.find(f => f.id === floorId) ?? building?.floors[0];
  const unit = floor?.apartments.find(a => a.id === unitId);
  const floorImage = floor ? resolveFloorImage(plan, floor) : undefined;
  const activeAlignment = alignment?.source === floor ? alignment : undefined;
  const displayFloor = floor ? { ...floor, apartments: activeAlignment?.apartments ?? floor.apartments, image: floorImage } : undefined;
  const floorOutline = building && floor ? floorBuildingOutline(plan, building, floor) : [];
  const locked = busy || uploading;
  const pending = drawingBuilding || drawingUnit || points.length > 0 || Boolean(activeAlignment);
  const center = { lat: Number(initial.project.location?.latitude ?? -12.0464), lng: Number(initial.project.location?.longitude ?? -77.0428) };
  const money = (value: number) => new Intl.NumberFormat("es-PE", { style: "currency", currency: initial.project.currency }).format(value);
  const totalUnits = buildings.reduce((n, b) => n + b.floors.reduce((m, f) => m + f.apartments.length, 0), 0);
  const basePath = `/admin/projects/${initial.project.id}/site-plan`;

  useEffect(() => {
    if (!dirty && !pending) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, pending]);

  function change(next: SitePlan) { setPlan(next); setDirty(true); setError(""); setMessage(""); }
  function resizeDrawing(amount: number | "FIT") {
    if (locked || pending) return;
    try {
      const next = resizePlanDrawing(plan, amount);
      setDrawingUndo(history => [...history.slice(-19), plan]);
      change(next); setMoveGeneral(false); setEditingFootprint(false); setShowGeneralImage(true);
      setMessage("Dibujo ajustado. Revisa cómo coincide con la imagen y guarda el borrador.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo ajustar el dibujo."); }
  }
  function updateGeneralImage(patch: Partial<PlanImage>) {
    if (!plan.image || locked || pending) return;
    const image = { ...plan.image, ...patch };
    if (!Number.isFinite(image.widthM) || !Number.isFinite(image.heightM) || image.widthM < 1 || image.heightM < 1 || image.widthM > 100000 || image.heightM > 100000 || !Number.isFinite(image.rotation) || Math.abs(image.rotation) > 360 || !Number.isFinite(image.center.lat) || Math.abs(image.center.lat) > 85 || !Number.isFinite(image.center.lng) || Math.abs(image.center.lng) > 180) { setError("Revisa las medidas, el giro y la posición del plano general."); return; }
    change(alignImageOnly ? { ...plan, image } : recalibratePlan(plan, image));
  }
  function updateBuildingPath(id: string, path: Point[]) {
    if (locked || pending || alignImageOnly || (!editingFootprint && !moveGeneral)) return;
    const previous = buildings.find(b => b.id === id);
    const previousPath = previous?.path ?? plan.zones.find(zone => zone.id === id)?.path;
    if (moveGeneral && plan.image && path[0] && previousPath?.[0]) {
      updateGeneralImage({ center: { lat: plan.image.center.lat + path[0].lat - previousPath[0].lat, lng: plan.image.center.lng + path[0].lng - previousPath[0].lng } });
    } else if (previous) change({ ...plan, buildings: buildings.map(b => b.id === id ? { ...b, path } : b) });
  }
  function patchBuilding(patch: Partial<PlanBuilding>) {
    if (!building) return;
    change({ ...plan, buildings: buildings.map(b => b.id === building.id ? { ...b, ...patch } : b) });
  }
  function patchFloor(patch: Partial<PlanFloor>) {
    if (!building || !floor) return;
    patchBuilding({ floors: building.floors.map(f => f.id === floor.id ? { ...f, ...patch } : f) });
  }
  function patchUnit(patch: Partial<PlanApartment>) {
    if (!floor || !unit) return;
    patchFloor({ apartments: floor.apartments.map(a => a.id === unit.id ? { ...a, ...patch } : a) });
  }
  function copyApartment(direction: "LEFT" | "RIGHT" | "UP" | "DOWN") {
    if (!floor || !unit || locked || pending) return;
    try {
      const copy = duplicateApartment(floor, unit, direction);
      patchFloor({ apartments: [...floor.apartments, copy] });
      setUnitId(copy.id);
      setMessage(`Departamento ${copy.code} creado. Puedes volver a duplicarlo o cambiar sus datos.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo duplicar el departamento."); }
  }
  function selectBuilding(id: string) {
    if (locked || pending) return;
    setBuildingId(id); setFloorId(undefined); setUnitId(undefined);
  }
  function addBuilding() {
    const minLat = Math.min(...footprint.map(p => p.lat)), minLng = Math.min(...footprint.map(p => p.lng));
    const width = Math.max(...footprint.map(p => p.lng)) - minLng, height = Math.max(...footprint.map(p => p.lat)) - minLat;
    if (!buildingName.trim() || !floorPolygonValid(footprint.map(p => ({ x: (p.lng - minLng) / width, y: (p.lat - minLat) / height }))) || polygonMetrics(footprint).areaM2 <= 0) {
      setError("Escribe el nombre del edificio y marca al menos tres vértices en orden, sin cruces."); return;
    }
    const next: PlanBuilding = { id: crypto.randomUUID(), name: buildingName.trim(), path: footprint, floors: [] };
    change({ ...plan, buildings: [...buildings, next] });
    setBuildingId(next.id); setFloorId(undefined); setUnitId(undefined); setFootprint([]); setDrawingBuilding(false); setBuildingName("");
  }
  function addFloor(copy = false) {
    if (!building) return;
    const number = Math.max(0, ...building.floors.map(f => f.number)) + 1;
    if (number > 300) { setError("El número máximo de piso es 300."); return; }
    const next: PlanFloor = copy && floor ? duplicateFloor(floor, number) : { id: crypto.randomUUID(), number, name: `Piso ${number}`, apartments: [] };
    if (!next.image) { const base = resolveFloorImage(plan, next); if (base) { next.image = base; next.imageSource = "BASE"; } }
    patchBuilding({ floors: [...building.floors, next] });
    setFloorId(next.id); setUnitId(undefined); setPoints([]); setDrawingUnit(false); setShowFloorImage(true);
    if (copy) setMessage("Piso duplicado con nuevos números. Los departamentos del nuevo piso quedan disponibles; revisa sus datos.");
    return next;
  }
  function addApartment(path: FloorPoint[]) {
    if (!floor || !floorPolygonValid(path)) { setError("Dibuja un departamento con al menos tres vértices y sin cruces."); return; }
    let index = floor.apartments.length;
    while (floor.apartments.some(a => a.code === apartmentCode(floor.number, index))) index++;
    const next: PlanApartment = { id: crypto.randomUUID(), code: apartmentCode(floor.number, index), areaM2: 0, price: 0, operation: "SALE", status: "AVAILABLE", maintenanceFee: 0, bedrooms: 0, bathrooms: 0, notes: "", path };
    patchFloor({ apartments: [...floor.apartments, next], ...(!floor.image && floorImage ? { image: floorImage, imageSource: "BASE" as const } : {}) });
    setUnitId(next.id); setDrawingUnit(false); setPoints([]);
    setMessage("Departamento dibujado. Completa su metraje, precio y condiciones antes de guardar.");
  }
  async function uploadFloor(file: File | undefined): Promise<boolean> {
    if (!file || !floor) return false;
    setUploading(true); setError("");
    try {
      const bitmap = await createImageBitmap(file);
      const width = bitmap.width, height = bitmap.height;
      bitmap.close();
      const uploaded = await uploadImageToCloudinary(file, PROJECT_MEDIA_FOLDER);
      patchFloor({ image: { url: uploaded.url, width, height }, imageSource: "CUSTOM" }); setShowFloorImage(true);
      return true;
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo subir el plano del piso."); return false; }
    finally { setUploading(false); }
  }
  async function uploadGeneral(file: File | undefined, source?: { file: File; page: number }): Promise<boolean> {
    if (!file || pending) return false;
    setUploading(true); setError("");
    try {
      const bitmap = await createImageBitmap(file);
      const ratio = bitmap.height / bitmap.width;
      bitmap.close();
      const uploaded = await uploadImageToCloudinary(file, PROJECT_MEDIA_FOLDER);
      const pdf = source ? await uploadToCloudinary(source.file, PROJECT_MEDIA_FOLDER, "raw") : undefined;
      const widthM = plan.image?.widthM ?? 200;
      const image: PlanImage = {
        url: uploaded.url, center: plan.image?.center ?? center,
        widthM, heightM: plan.image?.heightM ?? Math.max(1, Math.min(100000, widthM * ratio)), rotation: plan.image?.rotation ?? 0, opacity: plan.image?.opacity ?? .7,
        sourcePdfUrl: pdf?.url, sourcePdfPage: source?.page, sourcePdfName: source?.file.name,
      };
      change({ ...plan, image }); setShowGeneralImage(true); setView("PLAN"); setMoveGeneral(false);
      setMessage("Plano general cargado. Dibuja los edificios sobre la hoja y alinea el conjunto en Google Maps.");
      return true;
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo cargar el plano general."); return false; }
    finally { setUploading(false); }
  }
  async function save(publish: boolean) {
    if (pending) { setError("Termina o cancela el dibujo antes de guardar."); return; }
    for (const b of buildings) for (const f of b.floors) for (const a of f.apartments) {
      if (!a.code.trim() || !(a.areaM2 > 0) || !floorPolygonValid(a.path)) { setError(`Completa el metraje, número y dibujo de ${b.name}, ${f.name}, departamento ${a.code}.`); return; }
    }
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(`${env.apiUrl}${basePath}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ revision, plan, publish }) });
      const data = await response.json();
      if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message.join(" ") : data.message || "No se pudo guardar.");
      setRevision(data.revision); setDirty(false);
      setMoveGeneral(false); setEditingFootprint(false);
      if (publish) setPublishedAt(data.publishedAt);
      setMessage(publish ? "Edificios, pisos y departamentos publicados. Se mostrarán en la ficha pública cuando el proyecto esté publicado." : "Borrador guardado. La versión pública conserva la última publicación.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo guardar."); }
    finally { setBusy(false); }
  }

  return <section className={s.editor} aria-label="Editor de edificios y departamentos">
    <header className={s.header}>
      <div><p className={s.muted}>Edificios · Pisos · Departamentos</p><h1 className="text-2xl font-black">{initial.project.name}</h1><p className={s.muted}>{dirty ? "Cambios sin guardar" : "Borrador guardado"}{publishedAt ? ` · Publicado ${new Date(publishedAt).toLocaleDateString("es-PE")}` : ""}</p></div>
      <div className={s.actions}>
        <Link className={s.link} href={`/panel/admin/projects/${initial.project.id}/site-plan?view=environment`} onClick={event => { if ((dirty || pending) && !window.confirm("Hay cambios sin guardar. ¿Salir al editor del entorno?")) event.preventDefault(); }}>Entorno: calles y áreas comunes</Link>
        <button type="button" disabled={locked} onClick={() => void save(false)}><Save size={15} />Guardar borrador</button>
        <button type="button" className={s.primary} disabled={locked} onClick={() => void save(true)}>Publicar plano</button>
      </div>
    </header>
    {error && <p role="alert" className={s.error}>{error}</p>}
    {message && <p role="status" className={s.success}>{message}</p>}
    <fieldset disabled={locked} className={s.layout}>
      <div className={s.main}>
        <section className={s.card}>
          <div className={s.floorHeader}><h2><Building2 className="inline size-5" /> Plano general y edificios</h2><div className={s.actions}>
            <label className={s.link}><Upload size={15} />{plan.image ? "Reemplazar plano general" : "Cargar plano general"}<input hidden aria-label="Cargar plano general" type="file" accept="image/png,image/jpeg,image/webp,application/pdf" disabled={locked || pending} onChange={e => { const file = e.target.files?.[0]; if (file?.type === "application/pdf") setPdfFile({ file, target: "GENERAL" }); else void uploadGeneral(file); e.target.value = ""; }} /></label>
            <button type="button" disabled={pending} onClick={() => { setDrawingBuilding(true); setBuildingName(`Torre ${buildings.length + 1}`); setFootprint([]); setMoveGeneral(false); setEditingFootprint(false); setShowGeneralImage(true); if (plan.image) setView("PLAN"); }}><Plus size={15} />Dibujar edificio</button>
            <button type="button" disabled={pending || !building} className={editingFootprint ? s.active : ""} onClick={() => { setEditingFootprint(value => !value); setMoveGeneral(false); }}>{editingFootprint ? "Terminar edición del contorno" : "Editar contorno del edificio"}</button>
          </div></div>
          <div className={s.tabs} role="group" aria-label="Vista del plano general">
            <button type="button" disabled={locked || pending || !plan.image} className={moveDrawingOnSheet && view === "PLAN" ? s.active : ""} aria-pressed={moveDrawingOnSheet && view === "PLAN"} onClick={() => { setMoveDrawingOnSheet(value => !value); setView("PLAN"); setMoveGeneral(false); setEditingFootprint(false); setAlignImageOnly(false); }}>{moveDrawingOnSheet && view === "PLAN" ? "Terminar de mover dibujo" : "Mover dibujo sobre la hoja"}</button>
            <button type="button" disabled={locked || pending || !plan.image || !building} className={alignImageOnly ? s.active : ""} aria-pressed={alignImageOnly} onClick={() => { const next = !alignImageOnly; setAlignImageOnly(next); setMoveGeneral(next); setEditingFootprint(false); setView("MAP"); setShowGeneralImage(true); }}>{alignImageOnly ? "Terminar alineación de imagen" : "Alinear imagen con la torre"}</button>
            {alignImageOnly && <button type="button" disabled={locked || pending || !plan.image || !building} onClick={() => {
              if (!plan.image || !building?.path.length) return;
              const target = { lat: (Math.min(...building.path.map(p => p.lat)) + Math.max(...building.path.map(p => p.lat))) / 2, lng: (Math.min(...building.path.map(p => p.lng)) + Math.max(...building.path.map(p => p.lng))) / 2 };
              change({ ...plan, image: placeImageAnchor(plan.image, plan.image.center, target) }); setFocusRequest(value => value + 1);
            }}>Centrar imagen en la torre</button>}
            <button type="button" disabled={!plan.image} className={view === "PLAN" ? s.active : ""} aria-pressed={view === "PLAN"} onClick={() => { setView("PLAN"); setMoveGeneral(false); }}>Dibujar sobre plano</button>
            <button type="button" className={view === "MAP" ? s.active : ""} aria-pressed={view === "MAP"} onClick={() => { setView("MAP"); setMoveGeneral(false); setEditingFootprint(false); }}>Alinear en Google Maps</button>
            <button type="button" disabled={!plan.image} aria-pressed={showGeneralImage} onClick={() => { setShowGeneralImage(value => !value); setMoveGeneral(false); setEditingFootprint(false); }}>{showGeneralImage ? <EyeOff size={15} /> : <Eye size={15} />}{showGeneralImage ? "Ocultar imagen" : "Mostrar imagen"}</button>
            {plan.image?.crop && <button type="button" disabled={pending} onClick={() => { try { change(restorePlanCrop(plan)); setMessage("Hoja completa restaurada. Guarda el borrador para conservar el cambio."); } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo restaurar el plano."); } }}>Restaurar hoja completa</button>}
            {plan.image && <button type="button" disabled={pending} className={moveGeneral ? s.active : ""} onClick={() => { setView("MAP"); setMoveGeneral(value => !value); setEditingFootprint(false); }}>{moveGeneral ? "Terminar de mover" : "Mover plano con la mano"}</button>}
            {plan.image && <button type="button" onClick={() => { setView("MAP"); setFocusRequest(value => value + 1); }}>Enfocar plano</button>}
          </div>
          {plan.image && <div className={s.fields}>
            <span className={s.muted}>Tamaño de lo dibujado · contornos, calles y edificios</span>
            <div className={s.actions}>
              <button type="button" disabled={locked || pending} onClick={() => resizeDrawing(.5)}>Reducir a la mitad</button>
              <button type="button" disabled={locked || pending} onClick={() => resizeDrawing(.9)}>−10 %</button>
              <button type="button" disabled={locked || pending} onClick={() => resizeDrawing(.99)}>−1 %</button>
              <button type="button" disabled={locked || pending} onClick={() => resizeDrawing(1.01)}>+1 %</button>
              <button type="button" disabled={locked || pending} onClick={() => resizeDrawing(1.1)}>+10 %</button>
              <button type="button" disabled={locked || pending} onClick={() => resizeDrawing("FIT")}>Encajar dibujo en la hoja</button>
              <button type="button" disabled={locked || pending || !drawingUndo.length} onClick={() => { const previous = drawingUndo.at(-1); if (previous) { change(previous); setDrawingUndo(history => history.slice(0, -1)); } }}>Deshacer ajuste</button>
            </div>
          </div>}
          {alignImageOnly && <p className={s.muted}>Arrastra la imagen sobre el mapa hasta coincidir con la torre. El contorno queda fijo. Puedes ajustar escala, giro y transparencia abajo.</p>}
          {plan.image && <details className={s.card}><summary className="cursor-pointer text-sm font-bold">Ajustar escala, giro y transparencia</summary><div className={s.fields}>
            <div className={s.grid}>
              <label>Ancho del plano (m)<input type="number" min={1} max={100000} step="any" value={plan.image.widthM} disabled={pending} onChange={e => updateGeneralImage({ widthM: Number(e.target.value) })} /></label>
              <label>Alto del plano (m)<input type="number" min={1} max={100000} step="any" value={plan.image.heightM} disabled={pending} onChange={e => updateGeneralImage({ heightM: Number(e.target.value) })} /></label>
              <label>Giro del plano (grados)<input type="number" min={-360} max={360} step={.1} value={plan.image.rotation} disabled={pending} onChange={e => { updateGeneralImage({ rotation: Number(e.target.value) }); setView("MAP"); }} /></label>
              <label>Transparencia de la imagen en el mapa<input type="range" min={0} max={1} step={.05} value={plan.image.opacity} disabled={pending} onChange={e => updateGeneralImage({ opacity: Number(e.target.value) })} /></label>
            </div>
            <div className={s.actions}><button type="button" disabled={pending} onClick={() => { updateGeneralImage({ rotation: Math.max(-360, plan.image!.rotation - 1) }); setView("MAP"); }}>Girar 1° a la izquierda</button><button type="button" disabled={pending} onClick={() => { updateGeneralImage({ rotation: Math.min(360, plan.image!.rotation + 1) }); setView("MAP"); }}>Girar 1° a la derecha</button></div>
            <p className={s.muted}>{alignImageOnly ? "Arrastra la imagen hasta hacerla coincidir con el contorno. Ajusta escala y giro si hace falta; la torre y las calles permanecen fijas." : "Al mover, girar o cambiar la escala, los edificios y las calles acompañan al plano. Los dibujos interiores de cada piso se conservan."}</p>
            {plan.image.sourcePdfUrl && <a className={s.link} href={plan.image.sourcePdfUrl} target="_blank" rel="noreferrer">Ver PDF original · Página {plan.image.sourcePdfPage ?? 1}</a>}
          </div></details>}
          {!plan.image && <p className={s.notice}>Carga la hoja del plano general en imagen o PDF para dibujar los edificios con precisión. También puedes marcar sus contornos directamente sobre el mapa.</p>}
          {drawingBuilding && <div className={s.fields}>
            <label>Nombre del edificio<input maxLength={100} value={buildingName} onChange={e => setBuildingName(e.target.value)} /></label>
            <p className={s.muted}>{view === "PLAN" ? "Marca sus vértices sobre la hoja o arrastra para dibujar un rectángulo." : "Haz clic alrededor del edificio para marcar su contorno."}</p>
            <div className={s.actions}><button type="button" className={s.primary} disabled={footprint.length < 3} onClick={addBuilding}>Terminar contorno ({footprint.length})</button><button type="button" disabled={!footprint.length} onClick={() => setFootprint(footprint.slice(0, -1))}>Quitar punto</button><button type="button" onClick={() => { setDrawingBuilding(false); setFootprint([]); }}>Cancelar</button></div>
          </div>}
          {view === "MAP" && !drawingBuilding && <p className={s.muted}>Alinea la imagen con el terreno usando posición, escala y giro. Al ocultarla, los contornos quedan fijos. Activa Editar contorno solo cuando quieras modificar un edificio.</p>}
          {view === "PLAN" && plan.image ? <SitePlanCanvas plan={buildingMapPlan(plan)} tool={drawingBuilding ? "BLOCK" : "SELECT"} points={footprint} selected={editingFootprint ? building?.id : undefined} showImage={showGeneralImage}
            moveDrawing={moveDrawingOnSheet && !locked && !pending} onDrawingMove={(dx, dy) => {
              if (locked || pending || !plan.image) return;
              const image = plan.image;
              const translate = (point: Point) => { const uv = geoToImage(point, image); return imageToGeo({ x: uv.x + dx, y: uv.y + dy }, image); };
              setPlan(previous => ({ ...previous, zones: previous.zones.map(shape => ({ ...shape, path: shape.path.map(translate) })), lots: previous.lots.map(shape => ({ ...shape, path: shape.path.map(translate) })), buildings: previous.buildings?.map(shape => ({ ...shape, path: shape.path.map(translate) })) })); setDirty(true);
            }}
            onCrop={locked || pending ? undefined : selection => { try { change(cropPlan(plan, selection)); setMessage("Plano recortado. Guarda el borrador para conservar el cambio."); } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo recortar el plano."); } }}
            onPoint={p => { if (drawingBuilding && !locked) setFootprint(previous => [...previous, p]); }}
            onComplete={path => { if (drawingBuilding && !locked) setFootprint(path); }}
            onSelect={selectBuilding} onPath={updateBuildingPath} /> : <SitePlanMap plan={buildingMapPlan(plan)} center={center} showImage={showGeneralImage && Boolean(plan.image)} tool={drawingBuilding ? "BLOCK" : !alignImageOnly && (editingFootprint || moveGeneral) ? "SELECT" : undefined} selected={building?.id} points={footprint} legendStatuses={[]} legendAction={<span>{moveGeneral ? "Arrastra el plano y guarda el borrador al terminar" : "Contorno de edificios"}</span>}
            focusPlanRequest={focusRequest} moveAll={moveGeneral && !pending} onImageMove={target => updateGeneralImage({ center: target })}
            onPoint={p => { if (drawingBuilding && !locked) setFootprint(previous => [...previous, p]); }}
            onSelect={id => { if (!moveGeneral) selectBuilding(id); }}
            onPath={updateBuildingPath} />}
        </section>
        {floor ? <section id="apartment-floor-distribution" className={s.card}>
          <div className={s.floorHeader}><div><h2>{building?.name} · {floor.name}</h2><p className={s.muted}>Se muestra únicamente este piso.</p></div><div className={s.actions}>
            <label className={s.link}><Upload size={15} />{uploading ? "Subiendo…" : floorImage ? "Reemplazar plano de este piso" : "Cargar plano de este piso"}<input hidden aria-label="Reemplazar plano de este piso" type="file" accept="image/png,image/jpeg,image/webp,application/pdf" disabled={locked || pending} onChange={e => { const file = e.target.files?.[0]; if (file?.type === "application/pdf") setPdfFile({ file, target: "FLOOR" }); else void uploadFloor(file); e.target.value = ""; }} /></label>
            <button type="button" disabled={!floorImage} onClick={() => setShowFloorImage(value => !value)}>{showFloorImage ? "Ocultar plano del piso" : "Mostrar plano del piso"}</button>
            <button type="button" disabled={pending} onClick={() => { setDrawingUnit(true); setUnitId(undefined); setPoints([]); setShowFloorImage(true); }}>Dibujar departamento</button>
          </div></div>
          {drawingUnit && <><p className={s.notice}>Marca con clics las esquinas del departamento. Pulsa Terminar o cierra en el primer punto verde.</p><div className={s.tabs}><button type="button" disabled={points.length < 3} onClick={() => addApartment(points)}>Terminar departamento ({points.length} puntos)</button><button type="button" disabled={!points.length} onClick={() => setPoints(points.slice(0, -1))}>Quitar punto</button><button type="button" onClick={() => { setDrawingUnit(false); setPoints([]); }}>Cancelar</button></div></>}
          {!drawingUnit && <div className={s.tabs} role="group" aria-label="Duplicar departamento">
            <span className={s.muted}>{unit ? `Duplicar Dpto. ${unit.code}:` : "Arrastra para acomodar: los bordes cercanos se unen automáticamente. Mantén Shift para mover sin ajuste."}</span>
            <button type="button" disabled={!unit || locked || pending} onClick={() => copyApartment("LEFT")}>← Izquierda</button>
            <button type="button" disabled={!unit || locked || pending} onClick={() => copyApartment("RIGHT")}>Derecha →</button>
            <button type="button" disabled={!unit || locked || pending} onClick={() => copyApartment("UP")}>↑ Arriba</button>
            <button type="button" disabled={!unit || locked || pending} onClick={() => copyApartment("DOWN")}>↓ Abajo</button>
            <button type="button" disabled={!unit || locked || pending || !floor} onClick={() => {
              if(!floor||!unit)return;
              try { setAlignment({source:floor,apartments:alignFloorApartments(floor,unit.id,(floorImage?.height??700)/(floorImage?.width??1000))});setError(""); }
              catch(cause){setError(cause instanceof Error?cause.message:"No se pudo alinear el piso.");}
            }}>Alinear filas y columnas</button>
          </div>}
          {activeAlignment && <div className={s.notice}>
            <div className={s.actions}><button type="button" className={s.primary} onClick={()=>{patchFloor({apartments:activeAlignment.apartments});setAlignment(undefined);setMessage("Piso alineado. Revisa los metrajes y guarda el borrador para conservarlo.");}}>Aplicar alineación</button><button type="button" onClick={()=>setAlignment(undefined)}>Cancelar y conservar dibujos</button></div>
          </div>}
          {displayFloor && <ApartmentFloorCanvas onBlockPaths={activeAlignment || locked ? undefined : paths => { if (pending || !floor || paths.length !== floor.apartments.length || paths.some(path => !floorPolygonValid(path))) return; patchFloor({ apartments: floor.apartments.map((apartment, index) => ({ ...apartment, path: paths[index] })) }); }} currency={initial.project.currency} floor={displayFloor} outline={floorOutline} selected={unitId} drawing={drawingUnit} points={points} showImage={showFloorImage} onPoint={p => setPoints(previous => [...previous, p])} onDraw={addApartment} onSelect={id => { if (!locked) setUnitId(id); }} onPath={activeAlignment ? undefined : path => { if (!locked) patchUnit({ path }); }} />}
          <p className={s.muted}>{floor.imageSource === "BASE" || !floor.image ? floorImage ? "Este piso usa el plano base compartido. No necesitas cargarlo otra vez." : "Puedes cargar un plano general para reutilizarlo en los pisos, o cargar uno específico para este piso." : "Este piso tiene su propio plano. Reemplazarlo aquí conserva el plano general y los demás pisos."}</p>
          {floor.image && <button type="button" disabled={pending || !plan.image} onClick={() => { const base = resolveFloorImage(plan, { ...floor, image: undefined }); patchFloor({ image: base, imageSource: "BASE" }); setShowFloorImage(true); }}>Usar plano base en este piso</button>}
        </section> : <p className={s.empty}>{building ? "Añade el primer piso de este edificio para comenzar su distribución." : "Dibuja el primer edificio sobre el mapa para comenzar."}</p>}
      </div>
      <aside className={s.sidebar}>
        <section className={s.card}><h2>Proyecto</h2><div className={s.metrics}><span><strong>{buildings.length}</strong>Edificios</span><span><strong>{buildings.reduce((n, b) => n + b.floors.length, 0)}</strong>Pisos</span><span><strong>{totalUnits}</strong>Departamentos</span></div><div className={s.tabs}>{buildings.map(b => <button type="button" key={b.id} disabled={pending} className={building?.id === b.id ? s.active : ""} onClick={() => selectBuilding(b.id)}>{b.name}</button>)}</div></section>
        {building && <section className={s.card}><h2>{building.name}</h2><div className={s.fields}>
          <label>Nombre del edificio<input maxLength={100} value={building.name} onChange={e => patchBuilding({ name: e.target.value })} /></label>
          <div className={s.actions}><button type="button" disabled={pending} onClick={() => addFloor()}><Plus size={15} />Añadir piso</button><button type="button" disabled={!floor || pending} onClick={() => addFloor(true)}><Copy size={15} />Duplicar piso tipo</button></div>
          <div className={s.tabs}>{[...building.floors].sort((a, b) => a.number - b.number).map(f => <button type="button" key={f.id} disabled={pending} className={floor?.id === f.id ? s.active : ""} onClick={() => { setFloorId(f.id); setUnitId(undefined); }}>{f.name}</button>)}</div>
          <button type="button" className={s.danger} disabled={pending} onClick={() => { if (window.confirm(`¿Eliminar ${building.name} con todos sus pisos y departamentos del borrador?`)) { change({ ...plan, buildings: buildings.filter(b => b.id !== building.id) }); setBuildingId(undefined); setFloorId(undefined); setUnitId(undefined); } }}>Eliminar edificio del borrador</button>
        </div></section>}
        {floor && <section className={s.card}><h2>Datos del piso</h2><div className={s.fields}><div className={s.grid}>
          <label>Número de piso<input type="number" min={-20} max={300} step={1} value={floor.number} onChange={e => patchFloor({ number: Number(e.target.value) })} /></label>
          <label>Nombre<input maxLength={100} value={floor.name} onChange={e => patchFloor({ name: e.target.value })} /></label>
        </div><button type="button" className={s.danger} disabled={pending} onClick={() => { if (building && window.confirm(`¿Eliminar ${floor.name} y sus departamentos del borrador?`)) { patchBuilding({ floors: building.floors.filter(f => f.id !== floor.id) }); setFloorId(undefined); setUnitId(undefined); } }}>Eliminar piso</button></div>
          <div className={s.unitList}>{floor.apartments.map(a => <button type="button" key={a.id} disabled={pending} className={`${s.unitButton} ${a.id === unitId ? s.active : ""}`} onClick={() => setUnitId(a.id)}><span><strong>Dpto. {a.code}</strong><small>{a.areaM2} m² · {a.operation === "RENT" ? "Alquiler" : "Venta"}</small></span><span><strong>{money(a.price)}</strong><small>{APARTMENT_STATUS_LABELS[a.status]}</small></span></button>)}</div>
        </section>}
        {unit && <section className={s.card}><h2>Departamento {unit.code}</h2><div className={s.fields}>
          <div className={s.grid}><label>Número / código<input maxLength={80} value={unit.code} onChange={e => patchUnit({ code: e.target.value })} /></label><label>Metraje (m²)<input type="number" min={.01} step="any" value={unit.areaM2 || ""} onChange={e => patchUnit({ areaM2: Number(e.target.value) })} /></label></div>
          <div className={s.grid}><label>Operación<select value={unit.operation} onChange={e => patchUnit({ operation: e.target.value as "SALE" | "RENT", status: "AVAILABLE" })}><option value="SALE">Venta al contado</option><option value="RENT">Alquiler mensual</option></select></label><label>Estado<select value={unit.status} onChange={e => patchUnit({ status: e.target.value as PlanApartment["status"] })}>{Object.entries(APARTMENT_STATUS_LABELS).filter(([key]) => unit.operation === "SALE" ? key !== "RENTED" : key !== "SOLD").map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label></div>
          <div className={s.grid}><label>{unit.operation === "RENT" ? "Alquiler mensual" : "Precio al contado"} ({initial.project.currency})<input type="number" min={0} step="any" value={unit.price || ""} onChange={e => patchUnit({ price: Number(e.target.value) })} /></label><label>Mantenimiento mensual ({initial.project.currency})<input type="number" min={0} step="any" value={unit.maintenanceFee} onChange={e => patchUnit({ maintenanceFee: Number(e.target.value) })} /></label><label>Dormitorios<input type="number" min={0} max={100} step={1} value={unit.bedrooms} onChange={e => patchUnit({ bedrooms: Number(e.target.value) })} /></label><label>Baños<input type="number" min={0} max={100} step={1} value={unit.bathrooms} onChange={e => patchUnit({ bathrooms: Number(e.target.value) })} /></label></div>
          <label>Descripción / condiciones<textarea maxLength={2000} value={unit.notes} onChange={e => patchUnit({ notes: e.target.value })} /></label>
          <p className={s.muted}><span className={s.dot} style={{ background: APARTMENT_STATUS_COLORS[unit.status] }} />{APARTMENT_STATUS_LABELS[unit.status]}. Puedes arrastrar los vértices de su dibujo para ajustarlo.</p>
          <button type="button" className={s.primary} disabled={locked || pending || !dirty} onClick={() => void save(false)}><Save size={15} />Guardar departamento {unit.code}</button>
          <button type="button" className={s.danger} onClick={() => { if (window.confirm(`¿Eliminar el departamento ${unit.code} del borrador?`)) { patchFloor({ apartments: floor!.apartments.filter(a => a.id !== unit.id) }); setUnitId(undefined); } }}>Eliminar departamento</button>
        </div></section>}
      </aside>
    </fieldset>
    {pdfFile && <PdfPlanImport file={pdfFile.file} onImport={(image, source) => pdfFile.target === "GENERAL" ? uploadGeneral(image, source) : uploadFloor(image)} onClose={() => setPdfFile(undefined)} />}
  </section>;
}
