"use client";

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowUpRight, Building2, Check, ChevronLeft, ChevronRight, Droplets, Layers3, Image as ImageIcon, Lightbulb, MapPin, Phone, ShieldCheck, Waves, X, Zap } from 'lucide-react';
import { SitePlanMap } from '@/shared/ui/site-plan-map';
import { floorApartmentMapPlan } from '@/shared/lib/plan-coordinates';
import { APARTMENT_STATUS_LABELS, APARTMENT_STATUS_COLORS } from '@/shared/lib/apartment-plan';
import { ProtectedLotPdfDownload } from '@/shared/ui/protected-lot-pdf-download';
import { PublicPlanAccess } from '@/shared/ui/public-plan-access';
import { LotBudgetFinder } from '@/shared/ui/lot-budget-finder';
import { findBudgetLots, type LotBudgetFilter } from '@/shared/lib/lot-budget';
import type { SitePlan } from '@/shared/lib/site-plan';
import type { ProjectApiDetail } from '@/features/projects/types/api';
import { PROJECT_AMENITY_LABELS, PROJECT_SERVICE_LABELS, FINANCING_CONDITION_LABELS } from '@/features/projects/data/project-catalogs';
import { apiClient } from '@/shared/lib/api/client';
import { formatPrice } from '@/shared/lib/format';
import { buildArizWhatsappUrl } from '@/shared/lib/whatsapp';
import { ROUTES } from '@/shared/config/routes';
import { SharePropertyButton } from './share-property-button';
import { MapFilterSelect } from './map-filter-select';
import { createMapRequestCache } from '../lib/map-request-cache';
import type { Listing } from '../types/listing';
import s from './selected-project-explorer.module.css';

const EMPTY: SitePlan = { logoUrl: '', zones: [], lots: [] };
const NO_MARKERS: [] = [];
const STAGES = { PRE_SALE: 'Preventa', UNDER_CONSTRUCTION: 'En construcción', DELIVERED: 'Entregado' };
const getCachedProjectDetail = createMapRequestCache<ProjectApiDetail>();

export function SelectedProjectExplorer({ project, plan, planError, projectAccessGranted, accessCodeRequired, accessCodeError, accessCodeSkipped, accessCodeBusy, onSubmitAccessCode, onOmitAccessCode, onRequestAccessCode, focusPlanRequest, selectedLot, lotSheet, onSelectLot, onClose, onCloseLot, accessCode = '' }: {
  project: Listing; plan?: SitePlan | null; planError?: boolean; focusPlanRequest: number; selectedLot?: string; lotSheet?: ReactNode;
  accessCode?: string;
  projectAccessGranted?: boolean;
  accessCodeRequired?: boolean; accessCodeError?: boolean; accessCodeSkipped?: boolean; accessCodeBusy?: boolean;
  onSubmitAccessCode: (code: string) => void; onOmitAccessCode: () => void; onRequestAccessCode: () => void;
  onSelectLot: (id: string) => void; onClose: () => void; onCloseLot: () => void;
}) {
  const [detail, setDetail] = useState<ProjectApiDetail>();
  const [detailError, setDetailError] = useState(false);
  const [photo, setPhoto] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [planImagePreference, setPlanImagePreference] = useState<{ url: string; visible: boolean }>();
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [budgetFilter, setBudgetFilter] = useState<LotBudgetFilter | null>(null);
  const [buildingId, setBuildingId] = useState<string>();
  const [floorId, setFloorId] = useState<string>();
  const [towerFloors, setTowerFloors] = useState<Record<string, string>>({});
  const [apartmentId, setApartmentId] = useState<string>();
  const [apartmentStatus, setApartmentStatus] = useState('');
  const [apartmentQuery, setApartmentQuery] = useState('');
  const [floorFocus, setFloorFocus] = useState(0);
  const apartmentsMode = plan?.mode === 'APARTMENTS';
  const buildings = plan?.buildings ?? [];
  const building = buildings.find(item => item.id === buildingId) ?? buildings[0];
  const floors = [...(building?.floors ?? [])].sort((a,b) => a.number-b.number);
  const floor = floors.find(item => item.id === (floorId ?? towerFloors[building?.id ?? ''])) ?? floors.find(item => item.number === 1) ?? floors[0];
  const apartment = floor?.apartments.find(item => item.id === apartmentId);
  const displayedFloors = useMemo(() => (plan?.buildings ?? []).map(tower => {
    const sorted = [...tower.floors].sort((a,b) => a.number-b.number);
    const current = tower.id === building?.id ? floor : sorted.find(item => item.id === towerFloors[tower.id]) ?? sorted.find(item => item.number === 1) ?? sorted[0];
    return { tower, floor: current };
  }), [plan, building, floor, towerFloors]);
  const displayedUnits = useMemo(() => displayedFloors.flatMap(item => (item.floor?.apartments ?? []).map(unit => ({ ...item, unit }))), [displayedFloors]);
  const mapPlan = useMemo(() => {
    if (!apartmentsMode || !plan || !building) return plan ?? EMPTY;
    const base = floorApartmentMapPlan(plan, building, floor);
    return { ...base, lots: displayedFloors.flatMap(item => floorApartmentMapPlan(plan, item.tower, item.floor).lots) };
  }, [apartmentsMode, plan, building, floor, displayedFloors]);
  const finderLots = useMemo(() => apartmentsMode ? mapPlan.lots.filter(lot =>
    floor?.apartments.some(unit => unit.id === lot.id && (!apartmentStatus || unit.status === apartmentStatus)) &&
    lot.code.toLowerCase().includes(apartmentQuery.toLowerCase())
  ) : mapPlan.lots, [apartmentsMode, mapPlan, floor, apartmentStatus, apartmentQuery]);
  const matchingLotIds = useMemo(() => {
    if (!budgetFilter && (!apartmentsMode || (!buildingId && !floorId && !apartmentStatus && !apartmentQuery))) return undefined;
    const result = budgetFilter ? findBudgetLots(finderLots, budgetFilter) : undefined;
    const budgetIds = result && new Set([...result.matches, ...result.nearby].map(lot => lot.id));
    return finderLots.filter(lot => !budgetIds || budgetIds.has(lot.id)).map(lot => lot.id);
  }, [finderLots, budgetFilter, apartmentsMode, buildingId, floorId, apartmentStatus, apartmentQuery]);
  const info = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const imageTrigger = useRef<HTMLButtonElement>(null);
  const center = useMemo(() => ({ lat: detail?.location?.latitude ?? project.location.lat ?? -9.19, lng: detail?.location?.longitude ?? project.location.lng ?? -75.0152 }), [detail?.location?.latitude, detail?.location?.longitude, project.location.lat, project.location.lng]);
  const planImageUrl = plan?.image?.url;
  const showPlanImage = Boolean(planImageUrl && planImagePreference?.url === planImageUrl && planImagePreference.visible);
  const locationMarkers = useMemo(() => [{
    id: project.id,
    lat: center.lat,
    lng: center.lng,
    title: project.title,
    priceLabel: formatPrice(project.price.amount, project.price.currency),
    priceAmount: project.price.amount,
    priceCurrency: project.price.currency,
    iconUrl: '/web_v/ubicacion.png',
  }], [center.lat, center.lng, project.id, project.price.amount, project.price.currency, project.title]);
  useEffect(() => {
    let cancelled = false;
    let pending = false;
    async function refresh() {
      if (pending || document.hidden) return;
      pending = true;
      try {
        const data = await getCachedProjectDetail(
          project.slug,
          () => apiClient.get<ProjectApiDetail>(`/projects/${encodeURIComponent(project.slug)}`, { cache: 'no-store' }),
        );
        if (!cancelled) { setDetail(data); setDetailError(false); }
      } catch { if (!cancelled) setDetailError(true); }
      finally { pending = false; }
    }
    void refresh();
    const visible = () => { if (!document.hidden) void refresh(); };
    document.addEventListener('visibilitychange', visible);
    return () => { cancelled = true; document.removeEventListener('visibilitychange', visible); };
  }, [project.slug]);
  useEffect(() => { info.current?.scrollTo({ top: 0 }); }, [selectedLot, apartmentId]);
  useEffect(() => {
    if (lightbox) dialog.current?.showModal();
    else if (dialog.current?.open) dialog.current.close();
  }, [lightbox]);
  const images = [...new Set((detail?.images?.length ? detail.images : project.images).filter(Boolean))];
  const currentPhoto = images.length ? photo % images.length : 0;
  const lots = apartmentsMode ? (plan.buildings ?? []).flatMap(building => building.floors.flatMap(floor => floor.apartments)) : plan?.lots ?? [];
  const counts = { available: lots.filter(lot => lot.status === 'AVAILABLE').length, reserved: lots.filter(lot => lot.status === 'RESERVED').length, sold: lots.filter(lot => lot.status === 'SOLD').length };
  const soldPercent = lots.length ? Math.round(counts.sold / lots.length * 100) : 0;
  const description = detail?.description || project.description || '';
  const descriptionWords = description.trim().match(/\S+/g) ?? [];
  const isLongDescription = descriptionWords.length > 50;
  const visibleDescription = expandedDescription || !isLongDescription ? description : `${descriptionWords.slice(0, 50).join(' ')}…`;
  const contact = detail?.agent.whatsapp || detail?.agent.phone || project.contactWhatsapp;
  const message = `Hola, quisiera información del proyecto ${project.title}.`;
  const whatsapp = contact ? `https://wa.me/${contact.replace(/\D/g, '')}?text=${encodeURIComponent(message)}` : buildArizWhatsappUrl(message);
  function shiftPhoto(delta: number) { setPhoto(value => images.length ? (value + delta + images.length) % images.length : 0); }
  function selectLot(id: string) {
    if (apartmentsMode) {
      if (buildings.some(item => item.id === id)) { setBuildingId(id); setFloorId(undefined); setApartmentId(undefined); setFloorFocus(value => value + 1); setBudgetFilter(null); return; }
      const selected = displayedUnits.find(item => item.unit.id === id);
      if (!selected) return;
      setBuildingId(selected.tower.id);
      setFloorId(selected.floor?.id);
      setApartmentId(id);
    } else onSelectLot(id);
    if (window.matchMedia('(max-width: 1023px)').matches) requestAnimationFrame(() => info.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }
  const apartmentSheet = apartment && <article className={s.apartmentSheet} aria-label={`Ficha del departamento ${apartment.code}`}>
    <div className={s.infoHeader}><span className={s.eyebrow}>Ficha del departamento</span><button type="button" aria-label="Cerrar ficha del departamento" onClick={()=>setApartmentId(undefined)}><X size={18}/></button></div>
    <div className={s.apartmentHero}><Building2 size={26}/><h2>Departamento {apartment.code}</h2><p>{building?.name} · {floor?.name}</p><span className={s.apartmentBadge} style={{color:APARTMENT_STATUS_COLORS[apartment.status]}}><span style={{background:APARTMENT_STATUS_COLORS[apartment.status]}}/>{APARTMENT_STATUS_LABELS[apartment.status]}</span></div>
    <section className={s.apartmentPrice}><span>{apartment.operation === 'RENT' ? 'Alquiler mensual' : 'Precio de venta'}</span><strong>{formatPrice(apartment.price, project.price.currency)}</strong><small>{project.title}</small></section>
    <dl className={s.apartmentFacts}>{[['Área',`${apartment.areaM2} m²`],['Dormitorios',apartment.bedrooms],['Baños',apartment.bathrooms],['Mantenimiento mensual',formatPrice(apartment.maintenanceFee,project.price.currency)]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    {apartment.notes && <section className={s.apartmentNotes}><h3>Detalles del departamento</h3><p>{apartment.notes}</p></section>}
    <div className={s.apartmentActions}><ProtectedLotPdfDownload key={apartment.id} slug={project.slug} lotId={apartment.id} code={accessCode} unitType="apartment" className={s.apartmentDownload}/>
    <a className={s.apartmentContact} href={buildArizWhatsappUrl(`Hola, me interesa el departamento ${apartment.code}, ${building?.name}, ${floor?.name} del proyecto ${project.title}.`)} target="_blank" rel="noreferrer">Consultar por WhatsApp<ArrowUpRight size={16}/></a></div>
  </article>;
  return <section className={`${s.explorer} ${projectAccessGranted ? '' : s.locationOnly}`} aria-label={`Plano e información de ${project.title}`}>
    <div className={s.map}>
      <SitePlanMap lotSummary={apartmentsMode ? lot => { const unit = displayedUnits.find(item => item.unit.id === lot.id)?.unit; return { title: `Departamento ${lot.code}`, priceM2: undefined, price: formatPrice(lot.price, project.price.currency) + (unit?.operation === 'RENT' ? ' / mes' : ''), detail: `${lot.areaM2} m² · ${unit ? APARTMENT_STATUS_LABELS[unit.status] : ''}` }; } : undefined} matchingLotIds={matchingLotIds} currency={project.price.currency} plan={mapPlan} center={center} showImage={showPlanImage} mapType="roadmap" compactMapControl publicView legendStatuses={['SOLD', 'RESERVED', 'AVAILABLE']} legendAction={planImageUrl ? <button type="button" className={s.legendImageButton} aria-pressed={showPlanImage} onClick={() => setPlanImagePreference({ url: planImageUrl, visible: !showPlanImage })}><ImageIcon size={14} />{showPlanImage ? 'Ocultar imagen del plano' : 'Ver imagen del plano'}</button> : undefined} markers={projectAccessGranted && plan ? NO_MARKERS : locationMarkers} focusPlanRequest={Math.max(1, focusPlanRequest) + floorFocus} focusPlanZoom={17} selected={apartmentsMode ? apartmentId : selectedLot} onSelect={selectLot} className={s.mapSurface} />
      <button type="button" className={s.back} onClick={onClose}><ArrowLeft size={15} />Volver a proyectos</button>
      {projectAccessGranted && images.length > 0 && <button ref={imageTrigger} type="button" className={s.photoTrigger} onClick={() => setLightbox(true)} aria-label="Ver imágenes del proyecto"><ImageIcon size={16} />Ver imágenes</button>}
      {accessCodeSkipped && <button type="button" className={s.accessAgain} onClick={onRequestAccessCode}><ImageIcon size={16} />Ingresar código para ver el plano</button>}
      {accessCodeRequired && <div className={s.accessPrompt}><PublicPlanAccess open onSubmit={onSubmitAccessCode} onOmit={onOmitAccessCode} contactHref={buildArizWhatsappUrl(`Hola, quisiera coordinar con un asesor para obtener el código del proyecto ${project.title}.`)} invalid={accessCodeError} busy={accessCodeBusy} /></div>}

      {plan === undefined && !planError && !accessCodeRequired && !accessCodeSkipped && <p role="status" className={s.mapNotice}>Cargando plano del proyecto…</p>}
      {(plan === null || planError) && !accessCodeRequired && !accessCodeSkipped && <p role={planError ? 'alert' : 'status'} className={s.mapNotice}>{planError ? 'No se pudo actualizar el plano.' : 'Este proyecto todavía no tiene un plano publicado.'}</p>}
      {accessCodeSkipped && <p role="status" className={s.mapNotice}>Se muestra la ubicación del proyecto. El plano permanece oculto.</p>}
    </div>
    {projectAccessGranted && <aside ref={info} className={s.info} aria-label={apartmentId ? 'Ficha del departamento seleccionado' : selectedLot ? 'Ficha del lote seleccionado' : 'Información del proyecto'}>

      {apartmentSheet ? <><button type="button" className={s.returnInfo} onClick={()=>setApartmentId(undefined)}><ArrowLeft size={15}/>Información del proyecto</button>{apartmentSheet}</> : lotSheet ? <><button type="button" className={s.returnInfo} onClick={onCloseLot}><ArrowLeft size={15} />Información del proyecto</button>{lotSheet}</> : <>
        <div className={s.infoHeader}><span className={s.eyebrow}>Información del proyecto</span><button type="button" onClick={onClose} aria-label="Cerrar proyecto"><X size={19} /></button></div>
        {detail?.agent.name && <section className={s.developer}><span className={s.publisherInitial}>{detail.agent.name.charAt(0)}</span><div><span>Publicado por</span><strong>{detail.agent.name}</strong></div></section>}
        <h1>{detail?.name ?? project.title}</h1>
        <p className={s.location}><MapPin size={15} />{[project.location.district, project.location.province, project.location.department].filter((value, index, values) => value && values.indexOf(value) === index).join(', ')}</p>
        <section className={s.commercial}><span className={s.eyebrow}>Etapa comercial</span><h2>{detail ? STAGES[detail.stage] : 'Proyecto inmobiliario'}</h2><strong>Desde {formatPrice(detail?.cheapestLotPrice ?? detail?.priceFrom ?? project.price.amount, detail?.currency ?? project.price.currency)}</strong></section>
      {apartmentsMode && <section className={s.apartmentFilters} aria-label="Filtrar departamentos">
        <MapFilterSelect elegant icon={Building2} label="Torre" value={building?.id ?? ''} options={buildings.map(item=>({value:item.id,label:item.name}))} onChange={value=>{setBuildingId(value);setFloorId(undefined);setApartmentId(undefined);setBudgetFilter(null);setFloorFocus(previous=>previous+1);}}/>
        <MapFilterSelect elegant icon={Layers3} label="Piso" value={floor?.id ?? ''} options={floors.map(item=>({value:item.id,label:item.name}))} onChange={value=>{setFloorId(value);if(building) setTowerFloors(previous=>({...previous,[building.id]:value}));setApartmentId(undefined);setBudgetFilter(null);setFloorFocus(previous=>previous+1);}}/>
        <MapFilterSelect elegant icon={ShieldCheck} label="Estado" value={apartmentStatus} options={[{value:'',label:'Todos los estados'},...Object.entries(APARTMENT_STATUS_LABELS).filter(([value])=>value !== 'BLOCKED').map(([value,label])=>({value,label}))]} onChange={setApartmentStatus}/>
        <label>Buscar departamento<input type="search" value={apartmentQuery} onChange={event=>setApartmentQuery(event.target.value)} placeholder="Número de departamento"/></label>
      </section>}
        {plan && <LotBudgetFinder key={apartmentsMode ? `${building?.id}:${floor?.id}:${apartmentStatus}:${apartmentQuery}` : 'lots'} unitType={apartmentsMode ? 'apartment' : 'lot'} lots={finderLots} currency={detail?.currency ?? project.price.currency} filter={budgetFilter} onChange={setBudgetFilter} onSelect={selectLot} />}
        {plan && <section className={s.inventory}><div className={s.counts}>{[[counts.available, 'Disponibles'], [counts.reserved, 'Separados'], [counts.sold, 'Vendidos']].map(([count, label]) => <div key={label}><strong>{count}</strong><span>{label}</span></div>)}</div><div className={s.progress}><span>Avance de ventas</span><strong>{soldPercent}%</strong></div><progress value={soldPercent} max={100} aria-label="Avance de ventas" /><small>Datos del plano publicado · actualización cada 15 segundos</small></section>}
        <div className={s.contact}><a href={whatsapp} target="_blank" rel="noreferrer" className={s.whatsapp}>Consultar por WhatsApp<ArrowUpRight size={17} /></a><SharePropertyButton className={s.shareAction} buttonClassName={s.shareButton} title={project.title} latitude={project.location.lat} longitude={project.location.lng} href={ROUTES.project(project.slug)} label="Compartir" kind="proyecto" />{detail?.agent.phone && <a className={s.call} href={`tel:${detail.agent.phone}`}><Phone size={15} />Llamar</a>}</div>
        {description && <section className={s.section}><h2>Acerca del proyecto</h2><p id={`description-${project.id}`}>{visibleDescription}</p>{isLongDescription && <button type="button" className={s.readMore} aria-expanded={expandedDescription} aria-controls={`description-${project.id}`} onClick={() => setExpandedDescription(value => !value)}>{expandedDescription ? 'Ver menos' : 'Ver más'}</button>}</section>}
        {detail?.services.length ? <section className={s.section}><span className={s.eyebrow}>Infraestructura</span><h2>Servicios del proyecto</h2><div className={s.services}>{detail.services.map(service => {
          const Icon = service === 'agua' ? Droplets : service === 'electricidad' ? Zap : service === 'desague' ? Waves : service === 'alumbrado-publico' ? Lightbulb : service === 'titulo-propiedad' ? ShieldCheck : Building2;
          return <div key={service}><span className={s.serviceIcon}><Icon size={20} /></span><strong>{PROJECT_SERVICE_LABELS[service as keyof typeof PROJECT_SERVICE_LABELS] ?? service}</strong><span className={s.serviceStatus}><Check size={11} />Incluido</span></div>;
        })}</div></section> : null}
        {detail?.amenities.length ? <section className={s.section}><h2>Amenidades</h2><div className={s.chips}>{detail.amenities.map(amenity => <span key={amenity}><Check size={13} />{PROJECT_AMENITY_LABELS[amenity] ?? amenity}</span>)}</div></section> : null}
        {detail?.financing.length ? <section className={s.section}><h2>Financiamiento</h2><div className={s.chips}>{detail.financing.map(value => <span key={value}>{FINANCING_CONDITION_LABELS[value] ?? value}</span>)}</div>{detail.downPayment != null && <p>Inicial desde {formatPrice(detail.downPayment, detail.currency)}</p>}{detail.monthlyPayment != null && <p>Cuotas desde {formatPrice(detail.monthlyPayment, detail.currency)}</p>}</section> : null}
        {detailError && <p role="status" className={s.error}>No se pudo actualizar la información. Se reintentará automáticamente.</p>}
        <Link className={s.fullProject} href={ROUTES.project(project.slug)}>Ver proyecto completo<ArrowUpRight size={16} /></Link>
      </>}
    </aside>}
    <dialog ref={dialog} className={s.lightbox} aria-label="Galería del proyecto" onKeyDown={event => { if (event.key === 'ArrowLeft') { event.preventDefault(); shiftPhoto(-1); } if (event.key === 'ArrowRight') { event.preventDefault(); shiftPhoto(1); } }} onCancel={() => setLightbox(false)} onClose={() => { setLightbox(false); imageTrigger.current?.focus(); }}>
      <button type="button" className={s.closeGallery} aria-label="Cerrar galería" onClick={() => setLightbox(false)}><X size={22} /></button>
      {images.length > 0 && <img src={images[currentPhoto]} alt={`${project.title}, foto ${currentPhoto + 1}`} />}
      {images.length > 1 && <div className={s.lightboxControls}><button type="button" onClick={() => shiftPhoto(-1)} aria-label="Foto anterior"><ChevronLeft /></button><span>{currentPhoto + 1} / {images.length}</span><button type="button" onClick={() => shiftPhoto(1)} aria-label="Foto siguiente"><ChevronRight /></button></div>}
    </dialog>
  </section>;
}
