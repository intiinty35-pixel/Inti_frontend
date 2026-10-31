"use client";

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Building2, CalendarDays, Layers, MapPin, Search, SlidersHorizontal, Star } from 'lucide-react';
import { MapFilterSelect } from '@/features/listings/components/map-filter-select';
import { ListingImage } from '@/features/listings/components/listing-image';
import { ROUTES } from '@/shared/config/routes';
import { formatPrice } from '@/shared/lib/format';
import type { ProjectApiSummary } from '../types/api';
import s from './project-directory.module.css';

const MiniMap = dynamic(() => import('./project-directory-map').then(module => module.ProjectDirectoryMap), { ssr: false, loading: () => <div className={s.mapSkeleton}>Cargando vista del mapa…</div> });
const STAGES = { PRE_SALE: 'Preventa', UNDER_CONSTRUCTION: 'En construcción', DELIVERED: 'Entregado' };
const PAGE_SIZE = 18;

export function ProjectDirectory({ projects, loadError }: { projects: ProjectApiSummary[]; loadError: boolean }) {
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [origin, setOrigin] = useState('');
  const [stage, setStage] = useState('');
  const [sort, setSort] = useState('recent');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('PEN');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const results = useRef<HTMLDivElement>(null);
  const regions = useMemo(() => [...new Set(projects.map(project => project.location.department).filter(Boolean))].sort(), [projects]);
  const districts = useMemo(() => [...new Set(projects.filter(project => !region || project.location.department === region).map(project => project.location.district).filter(Boolean))].sort(), [projects, region]);
  const filtered = useMemo(() => projects.filter(project => (!region || project.location.department === region) && (!district || project.location.district === district) && (!origin || project.origin === origin) && (!stage || project.stage === stage) && (!budget || (project.currency === currency && (project.cheapestLotPrice ?? project.priceFrom) <= Number(budget))) && (!search.trim() || `${project.name} ${project.developer} ${project.location.district}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))).sort((a, b) => {
    if (sort === 'featured') return Number(b.featured) - Number(a.featured) || (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0);
    if (sort === 'recent') return (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0);
    return a.currency.localeCompare(b.currency) || (sort === 'price-asc' ? (a.cheapestLotPrice ?? a.priceFrom) - (b.cheapestLotPrice ?? b.priceFrom) : (b.cheapestLotPrice ?? b.priceFrom) - (a.cheapestLotPrice ?? a.priceFrom));
  }), [projects, region, district, origin, stage, budget, currency, search, sort]);
  const points = useMemo(() => filtered.flatMap(project => {
    const lat = project.location.lat ?? project.location.latitude;
    const lng = project.location.lng ?? project.location.longitude;
    return typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng) ? [{ id: project.id, lat, lng }] : [];
  }), [filtered]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  function change<T>(setValue: (value: T) => void, value: T) { setValue(value); setPage(1); }
  function goToPage(value: number) { setPage(value); results.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  return <div className={s.directory}>
    <section className={s.hero}>
      <div className={s.heroContent}><span className={s.heroBadge}><Star size={13} />PROYECTOS INMOBILIARIOS</span><h1>Encuentra tu próximo proyecto <span>en el Perú</span></h1><p>Explora proyectos de vivienda e inversión de INTI y de inmobiliarias de todo el país.</p><Link className={s.heroLink} href="#proyectos">Descubrir proyectos<ArrowUpRight size={17} /></Link></div>
      <div className={s.mapPreview}><MiniMap points={points} /><Link href={ROUTES.map} aria-label="Abrir el mapa interactivo de proyectos en Google Maps" className={s.mapLink}><span><MapPin size={15} />Explorar en el mapa<ArrowUpRight size={15} /></span></Link></div>
    </section>
    <div className={s.content}>
      <nav className={s.stages} aria-label="Etapa del proyecto">{[['', 'Todos los proyectos'], ...Object.entries(STAGES)].map(([value, label]) => <button key={value} type="button" aria-pressed={stage === value} onClick={() => change(setStage, value)}><Building2 size={14} />{label}</button>)}</nav>
      <section className={s.filters} aria-label="Filtrar proyectos"><label className={s.search}><Search size={15} /><input value={search} placeholder="Proyecto, inmobiliaria o distrito" aria-label="Buscar proyectos" onChange={event => change(setSearch, event.target.value)} /></label>
        <MapFilterSelect label="Región" value={region} onChange={value => { change(setRegion, value); setDistrict(''); }} options={[{ value: '', label: 'Todo el Perú' }, ...regions.map(value => ({ value, label: value }))]} />
        <MapFilterSelect label="Distrito" value={district} onChange={value => change(setDistrict, value)} options={[{ value: '', label: 'Todos los distritos' }, ...districts.map(value => ({ value, label: value }))]} />
        <MapFilterSelect label="Publicado por" value={origin} onChange={value => change(setOrigin, value)} options={[{ value: '', label: 'Todas las inmobiliarias' }, { value: 'ADMIN', label: 'INTI' }, { value: 'AGENT', label: 'Otras inmobiliarias' }]} />
        <MapFilterSelect label="Moneda" value={currency} onChange={value => change(setCurrency, value)} options={[{ value: 'PEN', label: 'Soles (S/)' }, { value: 'USD', label: 'Dólares ($)' }]} />
        <MapFilterSelect label="Presupuesto" value={budget} onChange={value => change(setBudget, value)} options={[{ value: '', label: 'Sin límite' }, ...[50000, 100000, 200000, 500000].map(value => ({ value: String(value), label: `Hasta ${formatPrice(value, currency as 'PEN' | 'USD')}` }))]} />
      </section>
      <div ref={results} id="proyectos" className={s.resultsHeader}><div><span className={s.eyebrow}>Vivienda e inversión</span><h2>Todos los proyectos</h2><p>{filtered.length} proyectos publicados</p></div><div className={s.sort}><SlidersHorizontal size={15} /><MapFilterSelect compact label="Ordenar proyectos" value={sort} onChange={value => change(setSort, value)} options={[{ value: 'recent', label: 'Más recientes' }, { value: 'featured', label: 'Destacados primero' }, { value: 'price-asc', label: 'Menor precio (por moneda)' }, { value: 'price-desc', label: 'Mayor precio (por moneda)' }]} /></div></div>
      {loadError && <p role="alert" className={s.notice}>No se pudieron cargar todos los proyectos. Actualiza la página para volver a intentarlo.</p>}
      {!visible.length ? <div role="status" className={s.empty}><span className="mx-auto grid size-12 place-items-center rounded-full bg-white text-brand shadow-sm"><Building2 size={22} aria-hidden="true" /></span><strong className="mt-3 block text-sm font-bold text-brand">{projects.length ? 'No encontramos proyectos con esos filtros' : 'Aún no hay proyectos que mostrar'}</strong><span className="mt-1 block text-xs leading-relaxed">{projects.length ? 'Prueba cambiar la búsqueda o los filtros seleccionados.' : 'Cuando se publiquen nuevos proyectos, aparecerán aquí.'}</span></div> : <div className={s.grid}>{visible.map(project => <article className={s.card} key={project.id}>
        <Link href={ROUTES.project(project.slug)} className={s.coverLink} aria-label={`Ver ${project.name}`}><ListingImage src={project.coverImage || project.images[0]} className={s.cover} />{project.featured && <span className={s.featured}><Star size={10} />Destacado</span>}</Link>
        <div className={s.cardBody}><Link href={ROUTES.project(project.slug)} className={s.cardTitle} title={project.name}>{project.name}</Link><p className={s.developer} title={project.developer}>{project.developer || (project.origin === 'ADMIN' ? 'INTI' : 'Proyecto inmobiliario')}</p><p className={s.location}><MapPin size={12} /><span>{project.location.district}, {project.location.department}</span></p><div className={s.cardMeta}><span><Layers size={12} />{project.lotsCount} lotes</span><span>{STAGES[project.stage]}</span></div>{project.publishedAt && <p className={s.date}><CalendarDays size={11} />{new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Lima' }).format(new Date(project.publishedAt))}</p>}<strong className={s.price}>Desde {formatPrice(project.cheapestLotPrice ?? project.priceFrom, project.currency)}</strong><Link href={ROUTES.project(project.slug)} className={s.projectLink}>Ver proyecto<ArrowUpRight size={14} /></Link></div>
      </article>)}</div>}
      {filtered.length > 0 && <footer className={s.pagination}><span>{(currentPage - 1) * PAGE_SIZE + 1} al {Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length} proyectos</span>{pages > 1 && <nav aria-label="Páginas de proyectos"><button type="button" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>Anterior</button><span>{currentPage} / {pages}</span><button type="button" disabled={currentPage === pages} onClick={() => goToPage(currentPage + 1)}>Siguiente</button></nav>}</footer>}
    </div>
  </div>;
}
