"use client";

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { List, Eye, EyeOff, X, MapPin, ArrowRight, Columns2, Map as MapIcon } from 'lucide-react';
import { SitePlanMap } from '@/shared/ui/site-plan-map';
import { LOT_LABELS, LOT_COLORS, type SitePlan, type PlanLot } from '@/shared/lib/site-plan';
import { apiClient } from '@/shared/lib/api/client';
import { ApiError } from '@/shared/lib/api/client';
import { ProtectedLotPdfDownload } from '@/shared/ui/protected-lot-pdf-download';
import { formatPrice } from '@/shared/lib/format';
import { buildArizWhatsappUrl } from '@/shared/lib/whatsapp';
import { ROUTES } from '@/shared/config/routes';
import { uniqueProjectListings } from '../lib/map-projects';
import { ListingImage } from './listing-image';
import { SharePropertyButton } from './share-property-button';
import type { Listing } from '../types/listing';
import { WhatsappIcon } from '@/shared/ui/icons';
import styles from './project-map-explorer.module.css';
import { MapFilterSelect } from './map-filter-select';
import { SelectedProjectExplorer } from './selected-project-explorer';

type PublishedPlan = SitePlan & { currency?: 'PEN' | 'USD' };
const EMPTY: SitePlan = { logoUrl: '', zones: [], lots: [] };
const CENTER = { lat: -9.19, lng: -75.0152 };
const PERU_BOUNDS = [{ lat: -18.35, lng: -81.4 }, { lat: 0.05, lng: -68.65 }];

function LotSheet({ lot, project, code, onClose }: { lot: PlanLot; project: Listing; code: string; onClose: () => void }) {
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
    <ProtectedLotPdfDownload className={styles.primary} slug={project.slug} lotId={lot.id} code={code} />
    <section className={styles.lotInquiry} aria-label={`Consulta por el lote ${lot.code}`}>
      <div>
        <span>¿Te interesa este lote?</span>
        <strong>Lote {lot.code} · {LOT_LABELS[lot.status]}</strong>
      </div>
      <a
        className={styles.contactButton}
        href={buildArizWhatsappUrl(`Hola ARIZ, me interesa el lote ${lot.code}${lot.block ? ` de la manzana ${lot.block}` : ''} del proyecto "${project.title}". ¿Me brindan más información?`)}
        target="_blank"
        rel="noreferrer"
      >
        <WhatsappIcon className={styles.contactIcon} />
        Consultar por WhatsApp
      </a>
    </section>
    <Link className={styles.projectLink} href={ROUTES.project(project.slug)}>Ver proyecto completo <ArrowRight size={15} /></Link>
  </article>;
}

export function MapPageExplorer({ listings, loadError = false, mapToolbarHref }: { listings: Listing[]; loadError?: boolean; mapToolbarHref?: string }) {
  const [operation, setOperation] = useState('buy');
  const [region, setRegion] = useState('');
  const [zone, setZone] = useState('');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('PEN');
  const [view, setView] = useState<'list' | 'both' | 'map'>('map');
  const [sort, setSort] = useState('recent');
  const filtersRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const filters = filtersRef.current;
    if (!filters) return;
    const measure = () => filters.parentElement?.style.setProperty('--map-filter-height', `${filters.getBoundingClientRect().height}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(filters);
    return () => observer.disconnect();
  }, []);
  const [resultsPage, setResultsPage] = useState(1);
  const sidebarRef = useRef<HTMLElement>(null);

  const allProjects = useMemo(() => uniqueProjectListings(listings), [listings]);
  const regions = useMemo(() => [...new Set(allProjects.map(p => p.location.department).filter(Boolean))].sort(), [allProjects]);
  const zones = useMemo(() => [...new Set(allProjects.filter(p => !region || p.location.department === region).map(p => p.location.district).filter(Boolean))].sort(), [allProjects, region]);
  const projects = useMemo(() => allProjects.filter(p => p.operation === operation && (!region || p.location.department === region) && (!zone || p.location.district === zone) && (!budget || (p.price.currency === currency && p.price.amount <= Number(budget)))), [allProjects, operation, region, zone, budget, currency]);
  const sortedProjects = useMemo(() => [...projects].sort((a, b) => {
    if (sort === 'recent') return (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0);
    const currencyOrder = a.price.currency.localeCompare(b.price.currency);
    return currencyOrder || (sort === 'price-asc' ? a.price.amount - b.price.amount : b.price.amount - a.price.amount);
  }), [projects, sort]);
  const [activeId, setActiveId] = useState<string>();
  const [panel, setPanel] = useState<'PROJECTS' | 'PROJECT' | 'LOT' | null>(null);
  const [selectedLot, setSelectedLot] = useState<string>();
  const [showPlanImage, setShowPlanImage] = useState(false);
  const [focusPlanRequest, setFocusPlanRequest] = useState(0);
  const [result, setResult] = useState<{ id: string; plan: PublishedPlan | null; error?: boolean; accessRequired?: boolean; invalidCode?: boolean; authorized?: boolean }>();
  const [accessCodes, setAccessCodes] = useState<Record<string, string>>({});
  const [accessDismissed, setAccessDismissed] = useState<Record<string, boolean>>({});
  const [validatingProjectId, setValidatingProjectId] = useState<string>();
  const active = projects.find(p => p.id === activeId);
  const plan = result?.id === activeId ? result?.plan : undefined;
  const error = result?.id === activeId && result?.error;
  const lot = plan?.lots.find(l => l.id === selectedLot);
  const lotCounts = useMemo(() => {
    const counts = { available: 0, reserved: 0, sold: 0 };
    for (const item of plan?.lots ?? []) {
      if (item.status === 'AVAILABLE') counts.available += 1;
      else if (item.status === 'RESERVED') counts.reserved += 1;
      else if (item.status === 'SOLD') counts.sold += 1;
    }
    return counts;
  }, [plan]);
  const markers = useMemo(() => projects.flatMap(project => {
    const { lat, lng } = project.location;
    return lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng) ? [{ id: project.id, lat, lng, title: project.title, priceLabel: formatPrice(project.price.amount, project.price.currency), priceAmount: project.price.amount, priceCurrency: project.price.currency, iconUrl: '/web_v/ubicacion.png' }] : [];
  }), [projects]);
  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    const project = active;
    const accessCode = accessCodes[project.id];
    if (!accessCode) return () => controller.abort();
    let pending = false;
    let focused = false;
    let loaded = false;
    async function refresh() {
      if (pending || document.hidden) return;
      pending = true;
      try {
        const data = await apiClient.get<PublishedPlan | null>(`/projects/${encodeURIComponent(project.slug)}/site-plan`, { cache: 'no-store', signal: controller.signal, headers: accessCode ? { 'X-Site-Plan-Code': accessCode } : undefined });
        if (controller.signal.aborted) return;
        if (data === undefined) throw new Error('La respuesta del plano está vacía.');
        setResult({ id: project.id, plan: data, authorized: true });
        setValidatingProjectId(undefined);
        loaded = true;
        if (data && !focused) { setFocusPlanRequest(value => value + 1); focused = true; }
      } catch (cause) {
        if (!controller.signal.aborted && !loaded) {
          if (cause instanceof ApiError && cause.status === 403)
            setResult({ id: project.id, plan: null, accessRequired: true, invalidCode: Boolean(accessCode) });
          else setResult({ id: project.id, plan: null, error: true });
          setValidatingProjectId(undefined);
        }
      } finally { pending = false; }
    }
    void refresh();
    const timer = accessCode ? window.setInterval(() => void refresh(), 15000) : undefined;
    const visible = () => { if (!document.hidden && accessCode) void refresh(); };
    document.addEventListener('visibilitychange', visible);
    return () => { controller.abort(); if (timer) clearInterval(timer); document.removeEventListener('visibilitychange', visible); };
  }, [active, accessCodes]);
  function selectProject(id: string) {
    setView('both');
    setActiveId(id);
    setSelectedLot(undefined);
    setShowPlanImage(false);
    setPanel('PROJECT');
    setAccessDismissed(previous => ({ ...previous, [id]: false }));
  }
  function selectLot(id: string) { if (!plan?.lots.some(l => l.id === id)) return; setSelectedLot(id); setPanel('LOT'); }
  function resetSelection() { setResultsPage(1); sidebarRef.current?.scrollTo({ top: 0 }); setActiveId(undefined); setSelectedLot(undefined); setPanel(view === 'map' ? null : 'PROJECTS'); }
  function changeView(value: 'list' | 'both' | 'map') { setResultsPage(1); sidebarRef.current?.scrollTo({ top: 0 }); setView(value); setPanel(value === 'map' ? null : 'PROJECTS'); setSelectedLot(undefined); }
  const resultsPageSize = view === 'list' ? 8 : 6;
  const resultsPages = Math.max(1, Math.ceil(sortedProjects.length / resultsPageSize));
  const currentResultsPage = Math.min(resultsPage, resultsPages);
  const resultsOffset = (currentResultsPage - 1) * resultsPageSize;
  const pageProjects = sortedProjects.slice(resultsOffset, resultsOffset + resultsPageSize);
  function goToResultsPage(page: number) {
    setResultsPage(Math.max(1, Math.min(page, resultsPages)));
    sidebarRef.current?.scrollTo({ top: 0 });
    if (window.matchMedia('(max-width: 767px)').matches || view === 'list') sidebarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  const sortControl = <MapFilterSelect compact label="Ordenar proyectos" value={sort} onChange={value => { setSort(value); setResultsPage(1); sidebarRef.current?.scrollTo({ top: 0 }); }} options={[{ value: 'recent', label: 'Más recientes' }, { value: 'price-asc', label: 'Menor precio (por moneda)' }, { value: 'price-desc', label: 'Mayor precio (por moneda)' }]} />;
  const listSummary = <><h2><MapPin size={17} />{projects.length} proyectos</h2>{sortControl}</>;
  return <div className={styles.explorer}>
    <div ref={filtersRef} className={`${styles.filters} ${mapToolbarHref ? styles.brandedFilters : ''}`} aria-label="Filtros del mapa">
      {mapToolbarHref && <Link href={ROUTES.home} className={styles.toolbarLogo} aria-label="ARIZ Proyectos, inicio"><img src="/logo/logo.png" alt="ARIZ Proyectos" /></Link>}
      <div className={styles.filterFields}>
      <div className={styles.operation} role="group" aria-label="Operación">{[['buy', 'Comprar'], ['rent', 'Alquilar']].map(([value, label]) => <button type="button" key={value} aria-pressed={operation === value} className={operation === value ? styles.filterActive : ''} onClick={() => { setOperation(value); resetSelection(); }}>{label}</button>)}</div>
      <MapFilterSelect label="Región" value={region} onChange={value => { setRegion(value); setZone(''); resetSelection(); }} options={[{ value: '', label: 'Todo el Perú' }, ...regions.map(value => ({ value, label: value }))]} />
      <MapFilterSelect label="Zona / distrito" value={zone} onChange={value => { setZone(value); resetSelection(); }} options={[{ value: '', label: 'Todas las zonas' }, ...zones.map(value => ({ value, label: value }))]} />
      <MapFilterSelect label="Quiero ver" value="projects" onChange={value => { window.location.href = `${ROUTES.properties}?operation=${operation}&type=${value}`; }} options={[{ value: 'projects', label: 'Proyectos' }, { value: 'houses', label: 'Casas' }, { value: 'apartments', label: 'Departamentos' }, { value: 'land', label: 'Terrenos' }]} />
      <MapFilterSelect label="Moneda" value={currency} onChange={value => { setCurrency(value); resetSelection(); }} options={[{ value: 'PEN', label: 'Soles (S/)' }, { value: 'USD', label: 'Dólares ($)' }]} />
      <MapFilterSelect label="Presupuesto" value={budget} onChange={value => { setBudget(value); resetSelection(); }} options={[{ value: '', label: 'Sin límite' }, ...[50000, 100000, 200000, 500000, 1000000].map(amount => ({ value: String(amount), label: `Hasta ${formatPrice(amount, currency as 'PEN' | 'USD')}` }))]} />
      </div>
      {mapToolbarHref && <Link href={mapToolbarHref} className={styles.publishButton}>Anuncia tu propiedad <ArrowRight size={17} /></Link>}
    </div>

    {loadError && <p role="alert" className={styles.notice}>No se pudieron cargar todos los proyectos. Vuelve a intentarlo en unos minutos.</p>}
    {!projects.length && !loadError && <p className={styles.emptyNotice} role="status">No hay proyectos con esos filtros.</p>}
    {active && (panel === 'PROJECT' || panel === 'LOT') ? <SelectedProjectExplorer key={active.id} project={active} plan={plan} accessCode={accessCodes[active.id] ?? ''} planError={!!error} projectAccessGranted={result?.id === active.id && !!result.authorized} accessCodeRequired={!accessDismissed[active.id] && (!!(result?.id === active.id && result.accessRequired) || !accessCodes[active.id] || validatingProjectId === active.id)} accessCodeError={!!(result?.id === active.id && result.invalidCode)} accessCodeSkipped={!!accessDismissed[active.id]} accessCodeBusy={validatingProjectId === active.id} onSubmitAccessCode={code => { setResult(undefined); setValidatingProjectId(active.id); setAccessCodes(previous => ({ ...previous, [active.id]: code })); }} onOmitAccessCode={() => { setValidatingProjectId(undefined); setAccessCodes(previous => ({ ...previous, [active.id]: '' })); setResult({ id: active.id, plan: null }); setAccessDismissed(previous => ({ ...previous, [active.id]: true })); }} onRequestAccessCode={() => { setValidatingProjectId(undefined); setAccessDismissed(previous => ({ ...previous, [active.id]: false })); }} focusPlanRequest={focusPlanRequest} selectedLot={selectedLot} onSelectLot={selectLot}
      onClose={() => { setSelectedLot(undefined); setActiveId(undefined); setPanel('PROJECTS'); setView('both'); }}
      onCloseLot={() => { setSelectedLot(undefined); setPanel('PROJECT'); }}
      lotSheet={panel === 'LOT' && lot ? <LotSheet lot={lot} project={active} code={accessCodes[active.id] ?? ''} onClose={() => { setSelectedLot(undefined); setPanel('PROJECT'); }} /> : undefined} /> : <div className={`${styles.layout} ${panel && view !== 'list' ? styles.withPanel : ''} ${view === 'list' ? styles.listOnly : ''}`}>
    <header className={styles.header}><h1 className="sr-only">Proyectos en el mapa</h1>{view === 'both' && <div className={styles.desktopSort}>{sortControl}</div>}<nav className={styles.viewControls} aria-label="Vista de resultados">{([['list', 'Lista', List], ['both', 'Ambos', Columns2], ['map', 'Mapa', MapIcon]] as const).map(([value, label, Icon]) => <button key={value} type="button" aria-pressed={view === value} className={view === value ? styles.filterActive : ''} onClick={() => changeView(value)}><Icon size={17} />{label}</button>)}</nav>{view === 'list' && <section className={`${styles.listHeader} ${styles.listToolbarResults}`} aria-label="Resultados">{listSummary}</section>}</header>
      <div className={styles.map}>
        <SitePlanMap currency={active?.price.currency} plan={plan ?? EMPTY} center={CENTER} overviewBounds={PERU_BOUNDS} mapType="roadmap" compactMapControl hideLegendOnMobile showImage={showPlanImage} publicView clusterMarkers={false} markers={markers} markerFocusId={activeId} hideFocusedMarker={!!plan} focusPlanRequest={focusPlanRequest} onMarkerSelect={selectProject} onSelect={selectLot} selected={selectedLot} className={styles.mapSurface} />

      </div>
      {panel && <aside ref={sidebarRef} className={styles.sidebar} aria-label={panel === 'LOT' ? 'Ficha del lote' : panel === 'PROJECT' ? 'Proyecto seleccionado' : 'Listado de proyectos'}>
        {panel === 'LOT' && lot && active ? <LotSheet lot={lot} project={active} code={accessCodes[active.id] ?? ''} onClose={() => { setSelectedLot(undefined); setPanel('PROJECT'); }} /> : <>
          {view !== 'list' && <header className={`${styles.listHeader} ${view === 'both' && panel === 'PROJECTS' ? styles.bothSummary : ''}`}>{panel === 'PROJECT' ? <><h2>Proyecto seleccionado</h2><button type="button" onClick={() => { setPanel('PROJECTS'); setActiveId(undefined); }} aria-label="Volver a todos los proyectos"><X size={19} /></button></> : listSummary}</header>}
          {panel === 'PROJECT' && plan === undefined && !error && <p className={styles.notice} role="status">Cargando plano…</p>}
          {panel === 'PROJECT' && plan === null && <p className={styles.notice} role={error ? "alert" : "status"}>{error ? 'No se pudo cargar el plano.' : 'Plano aún no publicado.'}</p>}
          <div className={`${styles.cards} ${panel === 'PROJECT' ? styles.detailCards : ''}`}>{(panel === 'PROJECT' && active ? [active] : pageProjects).map(project => <article key={project.id} className={`${styles.card} ${activeId === project.id ? styles.activeCard : ''}`}>
            <div className={styles.cardBadge}>EN VENTA</div>
            <button type="button" onClick={() => selectProject(project.id)} aria-label={`Ver ${project.title} en el mapa`}><ListingImage src={project.images[0]} className={styles.cover} /><div className={styles.cardBody}><h3>{project.title}</h3><p><MapPin size={13} /> {project.location.district}, {project.location.province}</p><strong>Desde {formatPrice(project.price.amount, project.price.currency)}</strong></div></button>
            {activeId === project.id && plan?.image && <button type="button" className={styles.imageToggle} onClick={() => { setShowPlanImage(value => !value); if (!showPlanImage) setFocusPlanRequest(value => value + 1); }}>{showPlanImage ? <EyeOff size={16} /> : <Eye size={16} />}{showPlanImage ? 'Ocultar imagen' : 'Ver imagen'}</button>}
            {panel === 'PROJECT' && activeId === project.id && <>
              {plan && <div className={styles.availability}>
                <div><strong className={styles.available}>{lotCounts.available}</strong><span>Disponibles</span></div>
                <div><strong className={styles.reserved}>{lotCounts.reserved}</strong><span>Reservados</span></div>
                <div><strong className={styles.sold}>{lotCounts.sold}</strong><span>Vendidos</span></div>
              </div>}
              <div className={styles.contactBlock}>
                <span className={styles.quickResponse}>Respuesta rápida</span>
                <div className={styles.contactActions}>
                  <a className={styles.contactButton} href={buildArizWhatsappUrl(`Hola ARIZ, vi el proyecto "${project.title}" en el mapa y quisiera más información.`)} target="_blank" rel="noreferrer"><WhatsappIcon className={styles.contactIcon} />Contactar</a>
                  <SharePropertyButton title={project.title} latitude={project.location.lat} longitude={project.location.lng} address={project.location.address} href={ROUTES.project(project.slug)} label="Compartir" kind="proyecto" className="w-full" buttonClassName="w-full justify-center" />
                </div>
              </div>
            </>}
            <Link href={ROUTES.project(project.slug)}>Explorar proyecto <ArrowRight size={14} /></Link>
          </article>)}</div>
          {panel === 'PROJECTS' && <div className={styles.paginationStatus}>
            <p role="status">{sortedProjects.length ? resultsOffset + 1 : 0} al {Math.min(resultsOffset + resultsPageSize, sortedProjects.length)} de {sortedProjects.length} proyectos</p>
            {resultsPages > 1 && <nav className={styles.pageControls} aria-label="Páginas de proyectos">
              <button type="button" disabled={currentResultsPage === 1} onClick={() => goToResultsPage(currentResultsPage - 1)}>Anterior</button>
              <span>{currentResultsPage} / {resultsPages}</span>
              <button type="button" disabled={currentResultsPage === resultsPages} onClick={() => goToResultsPage(currentResultsPage + 1)}>Siguiente</button>
            </nav>}
          </div>}
        </>}
      </aside>}
    </div>}

  </div>;
}
