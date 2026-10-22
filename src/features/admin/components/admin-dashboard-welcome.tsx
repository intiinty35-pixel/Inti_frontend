import Link from 'next/link';
import { ArrowUpRight, Building2, Home, Users, Crown, Megaphone, ChartNoAxesCombined, MapPin, ShieldCheck } from 'lucide-react';
import { ROUTES } from '@/shared/config/routes';
import s from './admin-dashboard-welcome.module.css';

const shortcuts = [
  { title: 'Gestionar proyectos', description: 'Planos, lotes y publicación', href: `${ROUTES.panel.admin.projects}/all`, Icon: Building2 },
  { title: 'Gestionar propiedades', description: 'Inmuebles, edición y disponibilidad', href: ROUTES.panel.admin.properties, Icon: Home },
  { title: 'Administrar cuentas', description: 'Usuarios y profesionales del sistema', href: ROUTES.panel.admin.accounts, Icon: Users },
  { title: 'Revisar membresías', description: 'Solicitudes, planes y suscripciones', href: ROUTES.panel.admin.subscriptions, Icon: Crown },
  { title: 'Gestionar campañas', description: 'Promociones y proyectos participantes', href: ROUTES.panel.admin.campaigns, Icon: Megaphone },
  { title: 'Consultar reportes', description: 'Resultados y seguimiento del sistema', href: ROUTES.panel.admin.reports, Icon: ChartNoAxesCombined },
];

export function AdminDashboardWelcome({ name }: { name?: string }) {
  return <header className={s.welcome}><div><p className={s.eyebrow}>Panel de administración · ARIZ</p><h1>{name?.trim() ? `Bienvenido, ${name.trim()}` : 'Bienvenido al panel de administración'}</h1><p className={s.description}>Esta es la actividad de tu sistema. Administra proyectos, propiedades y profesionales desde un solo lugar.</p></div><div className={s.welcomeActions}><span><ShieldCheck size={16} />Administrador</span><Link href={ROUTES.map}><MapPin size={17} />Ver mapa<ArrowUpRight size={15} /></Link></div></header>;
}

export function AdminDashboardShortcuts() {
  return <section className={s.shortcuts} aria-labelledby="admin-shortcuts-title"><div className={s.heading}><h2 id="admin-shortcuts-title">Accesos rápidos</h2></div><div className={s.grid}>{shortcuts.map(({ title, description, href, Icon }) => <Link key={href} href={href} className={s.shortcut}><span className={s.icon}><Icon size={21} /></span><div><h3>{title}</h3><p>{description}</p></div><ArrowUpRight size={15} className={s.arrow} /></Link>)}</div></section>;
}
