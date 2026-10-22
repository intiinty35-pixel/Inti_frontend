export default function AccountsLoading() {
  return <div className="grid gap-6" role="status" aria-label="Cargando cuentas">
    <p className="text-sm font-medium text-muted">Cargando cuentas…</p>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-hidden="true">{[0, 1, 2, 3].map(item => <div key={item} className="h-24 rounded-2xl border border-edge bg-surface motion-safe:animate-pulse" />)}</div>
    <div className="grid gap-4 xl:grid-cols-2" aria-hidden="true">{[0, 1, 2, 3].map(item => <div key={item} className="h-64 rounded-3xl border border-edge bg-surface p-6 motion-safe:animate-pulse"><div className="h-4 w-2/3 rounded bg-surface-muted" /><div className="mt-5 h-3 w-1/2 rounded bg-surface-muted" /></div>)}</div>
  </div>;
}
