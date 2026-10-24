import { FolderOpen, Layers, CircleCheck, Clock3, Tag } from 'lucide-react';
import s from './admin-portfolio-summary.module.css';

export type PortfolioSummary = { projects: number; availableProjects: number; reservedProjects: number; soldProjects: number; totalLots: number; available: number; reserved: number; sold: number; rented?: number; blocked: number };

export function AdminPortfolioSummary({ summary }: { summary: PortfolioSummary | null }) {
  if (!summary) return <p className={s.unavailable} role="status">El resumen del inventario no está disponible en este momento.</p>;
  const stats = [
    { label: 'Proyectos', count: summary.projects, note: 'En el portafolio', Icon: FolderOpen },
    { label: 'Unidades', count: summary.totalLots, note: 'Lotes y departamentos', Icon: Layers },
    { label: 'Disponibles', count: summary.available, note: 'Unidades disponibles', Icon: CircleCheck },
    { label: 'Separados', count: summary.reserved, note: 'Unidades reservadas', Icon: Clock3 },
    { label: 'Vendidos', count: summary.sold, note: 'Unidades vendidas', Icon: Tag },
    ...(summary.rented ? [{ label: 'Alquilados', count: summary.rented, note: 'Departamentos alquilados', Icon: Tag }] : []),
  ];
  const groups = [
    { label: 'Disponibles', count: summary.available, color: 'var(--brand)' },
    { label: 'Separados', count: summary.reserved, color: 'var(--accent)' },
    { label: 'Vendidos', count: summary.sold, color: '#8995b1' },
    ...(summary.rented ? [{ label: 'Alquilados', count: summary.rented, color: '#7c3aed' }] : []),
    { label: 'Bloqueados', count: summary.blocked, color: '#dce1ed' },
  ];
  let start = 0;
  const gradient = groups.map(group => { const end = start + (summary.totalLots ? group.count / summary.totalLots * 100 : 0); const segment = `${group.color} ${start}% ${end}%`; start = end; return segment; }).join(', ');
  return <section className={s.summary} aria-label="Resumen del portafolio">
    <div className={s.heading}><div><h2>Indicadores principales</h2></div><span>Resumen de todos los proyectos</span></div>
    <div className={s.cards}>{stats.map(({ label, count, note, Icon }) => <article className={s.card} key={label}><div><span>{label}</span><Icon size={17} /></div><strong>{count.toLocaleString('es-PE')}</strong><p>{note}</p></article>)}</div>
    <div className={s.panels}>
      <article className={s.inventory}><div className={s.panelTitle}><div><p>Inventario</p><h3>Estado de las unidades</h3></div><strong>{summary.totalLots.toLocaleString('es-PE')} <span>unidades en total</span></strong></div><div className={s.bar} role="img" aria-label={groups.map(group => `${group.label}: ${group.count}`).join(', ')}>{groups.map(group => <span key={group.label} style={{ width: `${summary.totalLots ? group.count / summary.totalLots * 100 : 0}%`, background: group.color }} />)}</div><div className={s.legend}>{groups.map(group => <span key={group.label}><i style={{ background: group.color }} />{group.label}<strong>{group.count}</strong></span>)}</div><p className={s.note}>Incluye lotes y departamentos del plano guardado; para proyectos sin plano se usa su inventario registrado.</p></article>
      <article className={s.projectPanel}><div><p className={s.kicker}>Portafolio</p><h3>Estado por proyecto</h3></div><div className={s.projectBody}><div className={s.donut} style={{ background: summary.totalLots ? `conic-gradient(${gradient})` : '#e7ebf3' }} aria-hidden="true"><div><strong>{summary.totalLots}</strong><span>unidades</span></div></div><div className={s.projectStats}>{[[summary.availableProjects, 'Con unidades disponibles'], [summary.reservedProjects, 'Con unidades separadas'], [summary.soldProjects, 'Vendidos']].map(([count, label]) => <div key={label}><span>{label}</span><strong>{count}</strong></div>)}</div></div><p className={s.note}>Un proyecto puede tener unidades disponibles y separadas a la vez.</p></article>
    </div>
  </section>;
}
