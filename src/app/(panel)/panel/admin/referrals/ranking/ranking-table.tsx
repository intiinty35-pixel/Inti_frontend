import { MessageCircle } from 'lucide-react';
import { MemberActions } from './member-actions';
import type { RankingRow } from './ranking-dashboard';
import s from './ranking-table.module.css';

const columns = ['Puesto', 'Miembro', 'Código', 'Teléfono', 'Correo', 'WhatsApp', 'Tipo de pago', 'Cuenta bancaria', 'Yape', 'Plin', 'Referidos', 'Concretados', 'Puntos', 'Último referido', 'Acciones'];

export function RankingTable({ rows, loading, onUpdated }: { rows: RankingRow[]; loading: boolean; onUpdated: () => Promise<void> }) {
  return <section className={s.sheet} aria-label="Tabla de ranking de miembros"><div className={s.scroll}><table className={s.table}><thead><tr>{columns.map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>
    {loading ? <tr><td colSpan={columns.length} className={s.empty}>Cargando ranking…</td></tr> : !rows.length ? <tr><td colSpan={columns.length} className={s.empty}>No hay miembros con ese filtro.</td></tr> : rows.map(row => <tr key={row.id}>
      <td className={s.rank}><span className={row.rank <= 3 ? s.topRank : ''}>{row.rank}</span></td>
      <td><span className={s.name} title={row.name}>{row.name}</span></td>
      <td className={s.code}>{row.code}</td>
      <td>{row.phone ? <a href={`tel:${row.phone.replace(/\s/g, '')}`}>{row.phone}</a> : '—'}</td>
      <td><a className={s.email} title={row.email} href={row.email ? `mailto:${row.email}` : undefined}>{row.email || '—'}</a></td>
      <td>{row.phone ? <a className={s.whatsapp} href={`https://wa.me/${row.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"><MessageCircle size={13} />Contactar</a> : '—'}</td>
      <td>{row.paymentType || '—'}</td>
      <td className={s.code}>{row.bankAccount || '—'}</td><td className={s.code}>{row.yape || '—'}</td><td className={s.code}>{row.plin || '—'}</td>
      <td className={s.number}>{row.referralsCount.toLocaleString('es-PE')}</td><td className={s.number}>{row.completedCount.toLocaleString('es-PE')}</td><td className={s.number}>{row.points.toLocaleString('es-PE')}</td>
      <td>{row.lastReferralAt ? new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/Lima' }).format(new Date(row.lastReferralAt)) : '—'}</td>
      <td className={s.actions}><MemberActions id={row.id} name={row.name} onUpdated={onUpdated} /></td>
    </tr>)}
  </tbody></table></div></section>;
}
