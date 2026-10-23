"use client";

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowUpRight, Building2, Check, ChevronLeft, ChevronRight, Droplets, Image as ImageIcon, Lightbulb, MapPin, Phone, ShieldCheck, Waves, X, Zap } from 'lucide-react';
import { SitePlanMap } from '@/shared/ui/site-plan-map';
import type { SitePlan } from '@/shared/lib/site-plan';
import type { ProjectApiDetail } from '@/features/projects/types/api';
import { PROJECT_AMENITY_LABELS, PROJECT_SERVICE_LABELS, FINANCING_CONDITION_LABELS } from '@/features/projects/data/project-catalogs';
import { apiClient } from '@/shared/lib/api/client';
import { formatPrice } from '@/shared/lib/format';
import { buildArizWhatsappUrl } from '@/shared/lib/whatsapp';
import { ROUTES } from '@/shared/config/routes';
import { SharePropertyButton } from './share-property-button';
import { ListingImage } from './listing-image';
import type { Listing } from '../types/listing';
import s from './selected-project-explorer.module.css';

const EMPTY: SitePlan = { logoUrl: '', zones: [], lots: [] };
const NO_MARKERS: [] = [];
const STAGES = { PRE_SALE: 'Preventa', UNDER_CONSTRUCTION: 'En construcción', DELIVERED: 'Entregado' };

export function SelectedProjectExplorer({ project, plan, planError, focusPlanRequest, selectedLot, lotSheet, onSelectLot, onClose, onCloseLot }: {
  project: Listing; plan?: SitePlan | null; planError?: boolean; focusPlanRequest: number; selectedLot?: string; lotSheet?: ReactNode;
  onSelectLot: (id: string) => void; onClose: () => void; onCloseLot: () => void;
}) {
  const [detail, setDetail] = useState<ProjectApiDetail>();
  const [detailError, setDetailError] = useState(false);
  const [photo, setPhoto] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [planImagePreference, setPlanImagePreference] = useState<{ url: string; visible: boolean }>();
  const [expandedDescription, setExpandedDescription] = useState(false);
  const info = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const imageTrigger = useRef<HTMLButtonElement>(null);
  const center = useMemo(() => ({ lat: project.location.lat ?? -9.19, lng: project.location.lng ?? -75.0152 }), [project.location.lat, project.location.lng]);
  const planImageUrl = plan?.image?.url;
  const showPlanImage = planImageUrl
    ? planImagePreference?.url === planImageUrl
      ? planImagePreference.visible
      : true
    : false;
  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    async function refresh() {
      if (pending || document.hidden) return;
      pending = true;
      try {
        const data = await apiClient.get<ProjectApiDetail>(`/projects/${encodeURIComponent(project.slug)}`, { cache: 'no-store', signal: controller.signal });
        if (!controller.signal.aborted) { setDetail(data); setDetailError(false); }
      } catch { if (!controller.signal.aborted) setDetailError(true); }
      finally { pending = false; }
    }
    void refresh();
    const timer = window.setInterval(() => void refresh(), 15000);
    const visible = () => { if (!document.hidden) void refresh(); };
    document.addEventListener('visibilitychange', visible);
    return () => { controller.abort(); clearInterval(timer); document.removeEventListener('visibilitychange', visible); };
  }, [project.slug]);
  useEffect(() => { info.current?.scrollTo({ top: 0 }); }, [selectedLot]);
  useEffect(() => {
    if (lightbox) dialog.current?.showModal();
    else if (dialog.current?.open) dialog.current.close();
  }, [lightbox]);
  const images = [...new Set((detail?.images?.length ? detail.images : project.images).filter(Boolean))];
  const currentPhoto = images.length ? photo % images.length : 0;
  const lots = plan?.lots ?? [];
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
    onSelectLot(id);
    if (window.matchMedia('(max-width: 1023px)').matches) requestAnimationFrame(() => info.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }
  return <section className={s.explorer} aria-label={`Plano e información de ${project.title}`}>
    <div className={s.map}>
      <SitePlanMap plan={plan ?? EMPTY} center={center} showImage={showPlanImage} mapType="roadmap" compactMapControl publicView legendStatuses={['SOLD', 'RESERVED', 'AVAILABLE']} legendAction={planImageUrl ? <button type="button" className={s.legendImageButton} aria-pressed={showPlanImage} onClick={() => setPlanImagePreference({ url: planImageUrl, visible: !showPlanImage })}><ImageIcon size={14} />{showPlanImage ? 'Ocultar imagen del plano' : 'Ver imagen del plano'}</button> : undefined} markers={NO_MARKERS} focusPlanRequest={focusPlanRequest} planContextRadiusM={150} selected={selectedLot} onSelect={selectLot} className={s.mapSurface} />
      <button type="button" className={s.back} onClick={onClose}><ArrowLeft size={15} />Volver a proyectos</button>

      {plan === undefined && !planError && <p role="status" className={s.mapNotice}>Cargando plano del proyecto…</p>}
      {(plan === null || planError) && <p role={planError ? 'alert' : 'status'} className={s.mapNotice}>{planError ? 'No se pudo actualizar el plano.' : 'Este proyecto todavía no tiene un plano publicado.'}</p>}
    </div>
    <div className={s.gallery} aria-label="Imágenes del proyecto">
      <button ref={imageTrigger} type="button" className={s.photo} disabled={!images.length} onClick={() => setLightbox(true)} aria-label="Ampliar imágenes del proyecto"><ListingImage src={images[currentPhoto]} className={s.photoImage} /><span className={s.photoHint}><ImageIcon size={16} />{images.length ? 'Ver imágenes' : 'Sin imágenes publicadas'}</span></button>
      {images.length > 1 && <div className={s.photoControls}><button type="button" onClick={() => shiftPhoto(-1)} aria-label="Foto anterior"><ChevronLeft size={20} /></button><button type="button" onClick={() => shiftPhoto(1)} aria-label="Foto siguiente"><ChevronRight size={20} /></button></div>}
      {images.length > 0 && <span className={s.photoCount}>{currentPhoto + 1} / {images.length} fotos</span>}
    </div>
    <aside ref={info} className={s.info} aria-label={selectedLot ? 'Ficha del lote seleccionado' : 'Información del proyecto'}>
      {lotSheet ? <><button type="button" className={s.returnInfo} onClick={onCloseLot}><ArrowLeft size={15} />Información del proyecto</button>{lotSheet}</> : <>
        <div className={s.infoHeader}><span className={s.eyebrow}>Información del proyecto</span><button type="button" onClick={onClose} aria-label="Cerrar proyecto"><X size={19} /></button></div>
        {detail?.agent.name && <section className={s.developer}><span className={s.publisherInitial}>{detail.agent.name.charAt(0)}</span><div><span>Publicado por</span><strong>{detail.agent.name}</strong></div></section>}
        <h1>{detail?.name ?? project.title}</h1>
        <p className={s.location}><MapPin size={15} />{[project.location.district, project.location.province, project.location.department].filter((value, index, values) => value && values.indexOf(value) === index).join(', ')}</p>
        <section className={s.commercial}><span className={s.eyebrow}>Etapa comercial</span><h2>{detail ? STAGES[detail.stage] : 'Proyecto inmobiliario'}</h2><strong>Desde {formatPrice(detail?.cheapestLotPrice ?? detail?.priceFrom ?? project.price.amount, detail?.currency ?? project.price.currency)}</strong></section>
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
    </aside>
    <dialog ref={dialog} className={s.lightbox} aria-label="Galería del proyecto" onKeyDown={event => { if (event.key === 'ArrowLeft') { event.preventDefault(); shiftPhoto(-1); } if (event.key === 'ArrowRight') { event.preventDefault(); shiftPhoto(1); } }} onCancel={() => setLightbox(false)} onClose={() => { setLightbox(false); imageTrigger.current?.focus(); }}>
      <button type="button" className={s.closeGallery} aria-label="Cerrar galería" onClick={() => setLightbox(false)}><X size={22} /></button>
      {images.length > 0 && <img src={images[currentPhoto]} alt={`${project.title}, foto ${currentPhoto + 1}`} />}
      {images.length > 1 && <div className={s.lightboxControls}><button type="button" onClick={() => shiftPhoto(-1)} aria-label="Foto anterior"><ChevronLeft /></button><span>{currentPhoto + 1} / {images.length}</span><button type="button" onClick={() => shiftPhoto(1)} aria-label="Foto siguiente"><ChevronRight /></button></div>}
    </dialog>
  </section>;
}
