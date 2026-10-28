"use client";

import { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import s from './profile-distribution.module.css';
import { normalizeProfileDistribution, type Distribution } from '../lib/profile-distribution';

const profiles = [
  { type: 'REAL_ESTATE_AGENCY', label: 'Inmobiliarias', color: '#00124f' },
  { type: 'INDEPENDENT_AGENT', label: 'Agentes', color: '#4774be' },
  { type: 'DEVELOPER', label: 'Desarrolladores', color: '#f2a900' },
  { type: 'INDIVIDUAL_OWNER', label: 'Propietarios', color: '#94a5c9' },
];

export function ProfileDistribution({ initialData }: { initialData?: Distribution }) {
  const [data, setData] = useState<Distribution | undefined>(initialData);
  const [hidden, setHidden] = useState<string[]>([]);
  const [error, setError] = useState(!initialData);
  const [updated, setUpdated] = useState<Date>();
  const [refreshing, setRefreshing] = useState(false);
  const requestController = useRef<AbortController | null>(null);
  useEffect(() => {
    return () => requestController.current?.abort();
  }, []);
  async function refresh() {
    if (requestController.current) return;
    const controller = new AbortController();
    requestController.current = controller;
    setRefreshing(true);
    try {
      const response = await fetch('/api/admin/professionals/distribution', {
        cache: 'no-store',
        credentials: 'same-origin',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('No se pudo actualizar la distribución de perfiles');
      const result = normalizeProfileDistribution(await response.json());
      if (!controller.signal.aborted) {
        setData(result);
        setUpdated(new Date());
        setError(false);
      }
    } catch {
      if (!controller.signal.aborted) setError(true);
    } finally {
      if (!controller.signal.aborted) {
        requestController.current = null;
        setRefreshing(false);
      }
    }
  }
  const items = profiles.filter(profile => !data || profile.type !== 'INDIVIDUAL_OWNER' || data.some(item => item.type === profile.type)).map(profile => ({ ...profile, count: data?.find(item => item.type === profile.type)?.count ?? 0 }));
  const visible = items.filter(item => !hidden.includes(item.type));
  const total = visible.reduce((sum, item) => sum + item.count, 0);
  let start = 0;
  const gradient = visible.map(item => { const end = start + (total ? item.count / total * 100 : 0); const segment = `${item.color} ${start}% ${end}%`; start = end; return segment; }).join(', ');
  return <div className={s.chart}>
    <div className={s.status}><span role="status">{error ? (data ? 'No se pudo actualizar · últimos datos disponibles' : 'No se pudieron cargar los perfiles') : updated ? `Actualizado ${updated.toLocaleTimeString('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : data ? 'Datos en caché · actualización manual' : 'Datos no disponibles'}</span><button type="button" aria-label="Actualizar distribución" onClick={refresh} disabled={refreshing}><RefreshCw size={14} className={refreshing ? 'animate-spin' : undefined} /></button></div>
    <div className={s.layout}><div className={s.donut} role="img" aria-label={data ? `Distribución: ${visible.map(item => `${item.label}: ${item.count}`).join(', ') || 'ningún perfil seleccionado'}` : 'Cargando distribución'} style={{ background: total ? `conic-gradient(${gradient})` : '#e9edf5' }}><div><strong>{data ? total.toLocaleString('es-PE') : '—'}</strong><span>perfiles visibles</span></div></div><div className={s.legend} role="group" aria-label="Filtrar perfiles">{items.map(item => { const active = !hidden.includes(item.type); return <button key={item.type} type="button" aria-pressed={active} onClick={() => setHidden(current => active ? [...current, item.type] : current.filter(type => type !== item.type))}><i style={{ background: active ? item.color : '#dce1eb' }} /><span>{item.label}</span><strong>{data ? item.count.toLocaleString('es-PE') : '—'}</strong><small>{active && total ? `${Math.round(item.count / total * 100)}%` : '—'}</small></button>; })}</div></div>
    <div className={s.footer}><p>Selecciona cada perfil para mostrarlo u ocultarlo.</p>{hidden.length > 0 && <button type="button" onClick={() => setHidden([])}>Mostrar todos</button>}</div>
    {data && !total && <p className={s.empty} role="status">{visible.length ? 'Sin perfiles en esta selección.' : 'Selecciona un perfil en la leyenda.'}</p>}
  </div>;
}
