"use client";

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { LayoutGrid, List, MapPin, Layers, PenLine, ArrowUpRight } from 'lucide-react';
import { apiClient } from '@/shared/lib/api/client';
import type { PlanSession } from '@/shared/lib/site-plan';
import { PROJECT_STATUS_LABELS, type ProjectApiSummary } from '../types/api';
import s from './admin-project-catalog.module.css';

function PlanPreview({ id }: { id: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<PlanSession>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      apiClient.get<PlanSession>(`/admin/projects/${encodeURIComponent(id)}/site-plan`, { signal: controller.signal })
        .then(data => { if (!controller.signal.aborted) { setResult(data); setFailed(false); } })
        .catch(() => { if (!controller.signal.aborted) setFailed(true); });
    }, { rootMargin: '150px' });
    if (host.current) observer.observe(host.current);
    return () => { observer.disconnect(); controller.abort(); };
  }, [id, attempt]);
  const plan = result?.plan;
  const shapes = [...(plan?.zones ?? []), ...(plan?.lots ?? [])].filter(shape => shape.path.length >= 3);
  const points = shapes.flatMap(shape => shape.path);
  const minLat = Math.min(...points.map(point => point.lat));
  const maxLat = Math.max(...points.map(point => point.lat));
  const minLng = Math.min(...points.map(point => point.lng));
  const maxLng = Math.max(...points.map(point => point.lng));
  const longitudeScale = Math.cos((minLat + maxLat) / 2 * Math.PI / 180);
  const width = (maxLng - minLng) * longitudeScale || 1;
  const height = maxLat - minLat || 1;
  const scale = 260 / Math.max(width, height);
  return <div className={s.preview} ref={host}>
    {points.length ? <svg viewBox="0 0 300 300" role="img" aria-label="Vista previa del dibujo del plano">{shapes.map(shape => <polygon key={shape.id} points={shape.path.map(point => `${20 + (260 - width * scale) / 2 + (point.lng - minLng) * longitudeScale * scale},${20 + (260 - height * scale) / 2 + (maxLat - point.lat) * scale}`).join(' ')} fill={'status' in shape ? 'var(--brand-soft)' : 'none'} stroke="var(--brand)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />)}</svg>
      : plan?.image?.url ? <img src={plan.image.url} alt="Plano del proyecto" loading="lazy" />
      : <div className={s.previewEmpty}><Layers size={30} /><span>{failed ? 'No se pudo cargar el plano' : result ? 'Plano aún sin dibujo' : 'Cargando plano…'}</span>{failed && <button type="button" onClick={() => { setFailed(false); setAttempt(value => value + 1); }}>Reintentar</button>}</div>}
    <span className={s.previewLabel}>Plano del proyecto</span>
  </div>;
}

export function AdminProjectCatalog({ projects }: { projects: ProjectApiSummary[] }) {
  const [view, setView] = useState<'list' | 'cards'>('list');
  const actions = (project: ProjectApiSummary) => <div className={s.actions}>
    <Link className={s.primary} href={`/panel/admin/projects/${project.id}/site-plan?view=lots`}><Layers size={15} />Ver lotes</Link>
    <Link href={`/panel/admin/projects/${project.id}/site-plan`}><PenLine size={15} />Editar plano y lotes</Link>
    <Link href={`/panel/admin/projects/${project.id}/edit`}>Editar proyecto<ArrowUpRight size={15} /></Link>
  </div>;
  return <section className={s.catalog}>
    <div className={s.toolbar}><p>{projects.length} proyectos en esta página</p><div className={s.switch} role="group" aria-label="Vista de proyectos"><button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}><List size={16} />Lista</button><button type="button" aria-pressed={view === 'cards'} onClick={() => setView('cards')}><LayoutGrid size={16} />Tarjetas</button></div></div>
    {!projects.length ? <p className={s.empty}>Todavía no hay proyectos registrados.</p> : view === 'list' ? <div className={s.tableWrap}><table className={s.table}><thead><tr>{['Proyecto', 'Origen', 'Estado', 'Lotes', 'Acciones'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{projects.map(project => <tr key={project.id}><td><strong>{project.name}</strong><p>{project.location?.district}</p></td><td>{project.origin === 'ADMIN' ? 'ARIZ' : 'Desarrollador'}</td><td><span className={s.badge}>{PROJECT_STATUS_LABELS[project.status]}</span></td><td>{project.lotsCount}</td><td>{actions(project)}</td></tr>)}</tbody></table></div> : <div className={s.grid}>{projects.map(project => <article className={s.card} key={project.id}><PlanPreview id={project.id} /><div className={s.body}><span className={s.badge}>{PROJECT_STATUS_LABELS[project.status]}</span><h2>{project.name}</h2><p><MapPin size={14} />{project.location?.district || 'Sin distrito'} · {project.origin === 'ADMIN' ? 'ARIZ' : 'Desarrollador'}</p><p><Layers size={14} />{project.lotsCount} lotes registrados</p>{actions(project)}</div></article>)}</div>}
  </section>;
}
