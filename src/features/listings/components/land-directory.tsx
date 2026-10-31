"use client";

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useMemo, useRef, useState } from 'react';
import { ArrowUpRight, CalendarDays, MapPin, Ruler, Search, SlidersHorizontal, Trees } from 'lucide-react';
import { MapFilterSelect } from './map-filter-select';
import { ListingImage } from './listing-image';
import { ROUTES } from '@/shared/config/routes';
import { formatPrice } from '@/shared/lib/format';
import type { Listing } from '../types/listing';
import s from '@/features/projects/components/project-directory.module.css';

const MiniMap = dynamic(() => import('@/features/projects/components/project-directory-map').then(module => module.ProjectDirectoryMap), { ssr: false, loading: () => <div className={s.mapSkeleton}>Cargando vista del mapa…</div> });
const PAGE_SIZE = 18;

export function LandDirectory({ listings, operation, loadError }: { listings: Listing[]; operation: 'buy' | 'rent'; loadError: boolean }) {
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [area, setArea] = useState('');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('PEN');
  const [sort, setSort] = useState('recent');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const results = useRef<HTMLDivElement>(null);
  const regions = useMemo(() => [...new Set(listings.map(item => item.location.department).filter(Boolean))].sort(), [listings]);
  const districts = useMemo(() => [...new Set(listings.filter(item => !region || item.location.department === region).map(item => item.location.district).filter(Boolean))].sort(), [listings, region]);
  const filtered = useMemo(() => listings.filter(item => (!region || item.location.department === region) && (!district || item.location.district === district) && (!budget || (item.price.currency === currency && item.price.amount <= Number(budget))) && (!area || (area === 'small' ? item.areaM2 > 0 && item.areaM2 <= 200 : area === 'medium' ? item.areaM2 > 200 && item.areaM2 <= 500 : item.areaM2 > 500)) && (!search.trim() || `${item.title} ${item.location.district} ${item.location.province}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))).sort((a, b) => sort === 'recent' ? (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0) : a.price.currency.localeCompare(b.price.currency) || (sort === 'price-asc' ? a.price.amount - b.price.amount : b.price.amount - a.price.amount)), [listings, region, district, budget, currency, area, search, sort]);
  const points = useMemo(() => filtered.flatMap(item => {
    const { lat, lng } = item.location;
    return typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng) ? [{ id: item.id, lat, lng }] : [];
  }), [filtered]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  function change<T>(setter: (value: T) => void, value: T) { setter(value); setPage(1); }
  function goToPage(value: number) { setPage(value); results.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  return <div className={s.directory}>
    <section className={s.hero} style={{ backgroundImage: "linear-gradient(90deg,#082a6bd9,#082a6b70),url('/inversiones/tumbes-coast-banner.png')" }}>
      <div className={s.heroContent}><span className={s.heroBadge}><Trees size={13} />TERRENOS {operation === 'rent' ? 'EN ALQUILER' : 'EN VENTA'}</span><h1>El espacio para tu próximo proyecto <span>está aquí</span></h1><p>Descubre terrenos {operation === 'rent' ? 'en alquiler' : 'en venta'} en el Perú. Compara ubicación, metraje y precio para encontrar tu próxima oportunidad.</p><Link className={s.heroLink} href="#terrenos">Explorar terrenos<ArrowUpRight size={17} /></Link></div>
      <div className={s.mapPreview}><MiniMap points={points} /><Link className={s.mapLink} href={ROUTES.map} aria-label="Abrir el mapa de INTI"><span><MapPin size={15} />Explorar en el mapa<ArrowUpRight size={15} /></span></Link></div>
    </section>
    <div className={s.content}>
      <nav className={s.stages} aria-label="Filtrar terrenos por metraje">{[['', 'Todos los terrenos'], ['small', 'Hasta 200 m²'], ['medium', 'Más de 200 a 500 m²'], ['large', 'Más de 500 m²']].map(([value, label]) => <button key={value} type="button" aria-pressed={area === value} onClick={() => change(setArea, value)}><Ruler size={14} />{label}</button>)}</nav>
      <section className={s.filters} aria-label="Filtros de terrenos"><label className={s.search}><Search size={15} /><input value={search} onChange={event => change(setSearch, event.target.value)} placeholder="Terreno, provincia o distrito" aria-label="Buscar terrenos" /></label>
        <MapFilterSelect label="Región" value={region} onChange={value => { change(setRegion, value); setDistrict(''); }} options={[{ value: '', label: 'Todo el Perú' }, ...regions.map(value => ({ value, label: value }))]} />
        <MapFilterSelect label="Distrito" value={district} onChange={value => change(setDistrict, value)} options={[{ value: '', label: 'Todos los distritos' }, ...districts.map(value => ({ value, label: value }))]} />
        <MapFilterSelect label="Operación" value={operation} onChange={value => { window.location.href = `${ROUTES.properties}?operation=${value}&type=land`; }} options={[{ value: 'buy', label: 'Comprar' }, { value: 'rent', label: 'Alquilar' }]} />
        <MapFilterSelect label="Moneda" value={currency} onChange={value => change(setCurrency, value)} options={[{ value: 'PEN', label: 'Soles (S/)' }, { value: 'USD', label: 'Dólares ($)' }]} />
        <MapFilterSelect label="Presupuesto" value={budget} onChange={value => change(setBudget, value)} options={[{ value: '', label: 'Sin límite' }, ...[50000, 100000, 200000, 500000].map(amount => ({ value: String(amount), label: `Hasta ${formatPrice(amount, currency as 'PEN' | 'USD')}` }))]} />
      </section>
      <div className={s.resultsHeader} ref={results} id="terrenos"><div><span className={s.eyebrow}>Espacio para crecer</span><h2>Terrenos {operation === 'rent' ? 'en alquiler' : 'en venta'}</h2><p>{filtered.length} terrenos publicados</p></div><div className={s.sort}><SlidersHorizontal size={15} /><MapFilterSelect compact label="Ordenar terrenos" value={sort} onChange={value => change(setSort, value)} options={[{ value: 'recent', label: 'Más recientes' }, { value: 'price-asc', label: 'Menor precio (por moneda)' }, { value: 'price-desc', label: 'Mayor precio (por moneda)' }]} /></div></div>
      {loadError && <p role="alert" className={s.notice}>No se pudieron cargar todos los terrenos. Actualiza la página para volver a intentarlo.</p>}
      {!visible.length ? <div role="status" className={s.empty}><span className="mx-auto grid size-12 place-items-center rounded-full bg-white text-brand shadow-sm"><Trees size={22} aria-hidden="true" /></span><strong className="mt-3 block text-sm font-bold text-brand">{listings.length ? 'No encontramos terrenos con esos filtros' : 'Aún no hay propiedades que mostrar'}</strong><span className="mt-1 block text-xs leading-relaxed">{listings.length ? 'Prueba cambiar la búsqueda o los filtros seleccionados.' : 'Cuando se publiquen nuevos terrenos, aparecerán aquí.'}</span></div> : <div className={s.grid}>{visible.map(item => <article className={s.card} key={item.id}><Link href={ROUTES.property(item.slug)} className={s.coverLink} aria-label={`Ver ${item.title}`}><ListingImage src={item.images[0]} className={s.cover} /><span className={s.featured}>{operation === 'rent' ? 'Alquiler' : 'En venta'}</span></Link><div className={s.cardBody}><Link className={s.cardTitle} href={ROUTES.property(item.slug)} title={item.title}>{item.title}</Link><p className={s.location}><MapPin size={12} /><span>{item.location.district}, {item.location.department}</span></p><div className={s.cardMeta}><span><Ruler size={12} />{item.areaM2 > 0 ? `${item.areaM2.toLocaleString('es-PE')} m²` : 'Área por consultar'}</span><span>Terreno</span></div>{item.publishedAt && <p className={s.date}><CalendarDays size={11} />{new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Lima' }).format(new Date(item.publishedAt))}</p>}<strong className={s.price}>{formatPrice(item.price.amount, item.price.currency)}{operation === 'rent' && item.price.period === 'mensual' ? ' / mes' : ''}</strong><Link className={s.projectLink} href={ROUTES.property(item.slug)}>Ver terreno<ArrowUpRight size={14} /></Link></div></article>)}</div>}
      {filtered.length > 0 && <footer className={s.pagination}><span>{(currentPage - 1) * PAGE_SIZE + 1} al {Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length} terrenos</span>{pages > 1 && <nav aria-label="Páginas de terrenos"><button type="button" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>Anterior</button><span>{currentPage} / {pages}</span><button type="button" disabled={currentPage === pages} onClick={() => goToPage(currentPage + 1)}>Siguiente</button></nav>}</footer>}
    </div>
  </div>;
}
