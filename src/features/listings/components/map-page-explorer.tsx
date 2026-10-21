"use client";

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { List, Eye, EyeOff, X, FileDown, MapPin, ArrowRight } from 'lucide-react';
import { SitePlanMap } from '@/shared/ui/site-plan-map';
import { LOT_LABELS, LOT_COLORS, type SitePlan, type PlanLot } from '@/shared/lib/site-plan';
import { apiClient } from '@/shared/lib/api/client';
import { env } from '@/shared/lib/env';
import { formatPrice } from '@/shared/lib/format';
import { ROUTES } from '@/shared/config/routes';
import { uniqueProjectListings } from '../lib/map-projects';
import { ListingImage } from './listing-image';
import type { Listing } from '../types/listing';
import styles from './project-map-explorer.module.css';

type PublishedPlan = SitePlan & { currency?: 'PEN' | 'USD' };
const EMPTY: SitePlan = { logoUrl: '', zones: [], lots: [] };
const CENTER = { lat: -9.19, lng: -75.0152 };
const PERU_BOUNDS = [{ lat: -18.35, lng: -81.4 }, { lat: 0.05, lng: -68.65 }];

function LotSheet({ lot, project, onClose }: { lot: PlanLot; project: Listing; onClose: () => void }) {
  const money = (amount: number) => formatPrice(amount, project.price.currency);
  const rows = [
    ['N.º de lote', lot.code], ['Manzana', lot.block || '—'], ['Dirección', lot.address || lot.street || project.location.address || project.location.district],
    ['Tipo', lot.type || '—'], ['Área', `${lot.areaM2} m²`], ['Perímetro', `${lot.perimeterM} m`], ['Dimensiones', lot.dimensions || '—'], ['Frente', `${lot.frontM} m`],
    ['Precio por m²', money(lot.priceM2)], ['Precio de venta', money(lot.cashAllowed ? lot.price : lot.financedPrice)],
  ];
  return <article className={styles.lotSheet}>
    <header><div><p className={styles.eyebrow}>Detalle del lote</p><h2>Lote {lot.code}</h2><p>{project.title}</p></div><button type="button" onClick={onClose} aria-label="Cerrar ficha del lote"><X size={19} /></button></header>
    <span className={styles.status} style={{ color: LOT_COLORS[lot.status] }}>{LOT_LABELS[lot.status]}</span>
    <table><tbody>{rows.map(([label, value]) => <tr key={label}><th>{label}</th><td>{value}</td></tr>)}</tbody></table>
    {lot.financingAllowed && <section className={styles.finance}><h3>Financiamiento</h3><p>Inicial: {money(lot.downPayment)}</p><p>{lot.installments} cuotas de {money(lot.monthlyPayment)}</p>{!!lot.interestRateMonthly && <p>Tasa mensual: {lot.interestRateMonthly}%</p>}<strong>Total: {money(lot.interestRateMonthly ? lot.downPayment + lot.installments * lot.monthlyPayment : lot.financedPrice)}</strong></section>}
    <a className={styles.primary} href={`${env.apiUrl}/projects/${encodeURIComponent(project.slug)}/site-plan/lots/${lot.id}/pdf`}><FileDown size={17} /> Descargar ficha PDF</a>
    <Link className={styles.projectLink} href={ROUTES.project(project.slug)}>Ver proyecto completo <ArrowRight size={15} /></Link>
  </article>;
}

export function MapPageExplorer({ listings, loadError = false }: { listings: Listing[]; loadError?: boolean }) {
  const projects = useMemo(() => uniqueProjectListings(listings), [listings]);
  const [activeId, setActiveId] = useState<string>();
  const [panel, setPanel] = useState<'PROJECTS' | 'PROJECT' | 'LOT' | null>(null);
  const [selectedLot, setSelectedLot] = useState<string>();
  const [showPlanImage, setShowPlanImage] = useState(false);
  const [focusPlanRequest, setFocusPlanRequest] = useState(0);
  const [result, setResult] = useState<{ id: string; plan: PublishedPlan | null; error?: boolean }>();
  const cache = useRef(new globalThis.Map<string, PublishedPlan | null>());
  const active = projects.find(p => p.id === activeId);
  const plan = result?.id === activeId ? result?.plan : undefined;
  const error = result?.id === activeId && result?.error;
  const lot = plan?.lots.find(l => l.id === selectedLot);
  const markers = useMemo(() => projects.flatMap(project => {
    const { lat, lng } = project.location;
    return lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng) ? [{ id: project.id, lat, lng, title: project.title, priceLabel: formatPrice(project.price.amount, project.price.currency), iconUrl: '/web_v/ubicacion.png' }] : [];
  }), [projects]);
  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    const project = active;
    void (async () => {
      try {
        const data = cache.current.has(project.id) ? cache.current.get(project.id)! : await apiClient.get<PublishedPlan | null>(`/projects/${encodeURIComponent(project.slug)}/site-plan`, { cache: 'no-store', signal: controller.signal });
        if (controller.signal.aborted) return;
        cache.current.set(project.id, data);
        setResult({ id: project.id, plan: data });
        if (data) setFocusPlanRequest(value => value + 1);
      } catch { if (!controller.signal.aborted) setResult({ id: project.id, plan: null, error: true }); }
    })();
    return () => controller.abort();
  }, [active]);
  function selectProject(id: string) {
    if (id === activeId && plan) setFocusPlanRequest(value => value + 1);
    setActiveId(id);
    setSelectedLot(undefined);
    setShowPlanImage(false);
    setPanel('PROJECT');
  }
  function selectLot(id: string) { if (!plan?.lots.some(l => l.id === id)) return; setSelectedLot(id); setPanel('LOT'); }
  return <div className={styles.explorer}>

    {loadError && <p role="alert" className={styles.notice}>No se pudieron cargar todos los proyectos. Vuelve a intentarlo en unos minutos.</p>}
    {!projects.length && !loadError && <p className={styles.notice}>Aún no hay proyectos publicados para mostrar.</p>}
    <div className={`${styles.layout} ${panel ? styles.withPanel : ''}`}>
      <div className={styles.map}>
    <header className={styles.header}><div><h1>Proyectos en el mapa</h1></div><button type="button" className={panel === 'PROJECTS' ? styles.primary : styles.secondary} aria-expanded={panel === 'PROJECTS'} onClick={() => { setSelectedLot(undefined); setPanel(panel === 'PROJECTS' ? null : 'PROJECTS'); }}><List size={18} /> Listar</button></header>
        <SitePlanMap plan={plan ?? EMPTY} center={CENTER} overviewBounds={PERU_BOUNDS} mapType="roadmap" compactMapControl showImage={showPlanImage} publicView markers={markers} markerFocusId={activeId} hideFocusedMarker={!!plan} focusPlanRequest={focusPlanRequest} onMarkerSelect={selectProject} onSelect={selectLot} selected={selectedLot} className={styles.mapSurface} />

      </div>
      {panel && <aside className={styles.sidebar} aria-label={panel === 'LOT' ? 'Ficha del lote' : panel === 'PROJECT' ? 'Proyecto seleccionado' : 'Listado de proyectos'}>
        {panel === 'LOT' && lot && active ? <LotSheet lot={lot} project={active} onClose={() => { setSelectedLot(undefined); setPanel(null); }} /> : <>
          <header className={styles.listHeader}><h2>{panel === 'PROJECT' ? 'Proyecto seleccionado' : `Proyectos (${projects.length})`}</h2><button type="button" onClick={() => setPanel(null)} aria-label="Cerrar listado de proyectos"><X size={19} /></button></header>
          {panel === 'PROJECT' && plan === undefined && !error && <p className={styles.notice} role="status">Cargando plano…</p>}
          {panel === 'PROJECT' && plan === null && <p className={styles.notice} role={error ? "alert" : "status"}>{error ? 'No se pudo cargar el plano.' : 'Plano aún no publicado.'}</p>}
          <div className={styles.cards}>{(panel === 'PROJECT' && active ? [active] : projects).map(project => <article key={project.id} className={`${styles.card} ${activeId === project.id ? styles.activeCard : ''}`}><button type="button" onClick={() => selectProject(project.id)} aria-label={`Ver ${project.title} en el mapa`}><ListingImage src={project.images[0]} className={styles.cover} /><div className={styles.cardBody}><h3>{project.title}</h3><p><MapPin size={13} /> {project.location.district}, {project.location.province}</p><strong>Desde {formatPrice(project.price.amount, project.price.currency)}</strong></div></button>{activeId === project.id && plan?.image && <button type="button" className={styles.imageToggle} onClick={() => { setShowPlanImage(value => !value); if (!showPlanImage) setFocusPlanRequest(value => value + 1); }}>{showPlanImage ? <EyeOff size={16} /> : <Eye size={16} />}{showPlanImage ? 'Ocultar imagen' : 'Ver imagen'}</button>}<Link href={ROUTES.project(project.slug)}>Ver proyecto <ArrowRight size={14} /></Link></article>)}</div>
        </>}
      </aside>}
    </div>

  </div>;
}
