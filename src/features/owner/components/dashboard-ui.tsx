import type { ReactNode } from "react";
import { Card, CardContent } from "@/shared/ui";

/** Piezas visuales compartidas por Dashboard y Estadisticas, para que ambas paginas se vean como un mismo sistema. */

export function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="relative overflow-hidden rounded-card border border-edge bg-surface px-5 py-5 text-center shadow-[var(--shadow-card)]">
      <span className="absolute inset-x-0 top-0 h-1 bg-accent" aria-hidden />
      <p className="text-[11px] font-black tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-2 font-display text-3xl font-black tracking-tight text-brand">{value}</p>
      <p className="mt-1 text-[11px] font-semibold text-muted">{hint}</p>
    </div>
  );
}

export function DashboardPanel({ title, badge, children }: { title: string; badge?: ReactNode; children: ReactNode }) {
  return (
    <Card className="min-h-72 min-w-0 overflow-hidden border-edge bg-[linear-gradient(180deg,#ffffff_0%,#f9fafc_100%)]">
      <div className="h-1 bg-brand" aria-hidden />
      <CardContent className="flex min-h-72 flex-col items-center pt-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <p className="font-semibold text-ink">{title}</p>
          {badge}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

export function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
      <div aria-hidden className="flex h-9 items-end gap-1 opacity-40">
        {[45, 70, 40, 90, 55, 80].map((height, index) => (
          <span key={index} className="w-3 rounded-sm bg-edge" style={{ height: `${height}%` }} />
        ))}
      </div>
      <p className="mt-3 text-xs font-semibold text-ink">Sin datos todavía</p>
      <p className="mt-0.5 text-[11px] text-muted">{message}</p>
    </div>
  );
}
