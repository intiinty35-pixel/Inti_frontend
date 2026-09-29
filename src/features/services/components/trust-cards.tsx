import { cn } from "@/shared/lib/cn";
import {
  INTEGRAL_SUPPORT,
  PROJECT_CAPABILITIES,
  TRUST_LOGOS,
  type Capability,
} from "@/features/services/config";

/** 6 columnas en escritorio, 3 en tablet y 2 en móvil. */
const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6";

const ROW_TITLE = "text-center text-[11px] font-bold tracking-[0.18em] text-accent uppercase";

function RowHeading({ children }: { children: string }) {
  return (
    <div className="mb-5 flex items-center justify-center gap-4">
      <span aria-hidden className="h-px w-8 bg-edge sm:w-16" />
      <h3 className={ROW_TITLE}>{children}</h3>
      <span aria-hidden className="h-px w-8 bg-edge sm:w-16" />
    </div>
  );
}

/**
 * Fila 1: instituciones. El logo arranca en escala de grises y recupera color
 * al pasar el cursor, el gesto clasico de confianza de una vitrina de aliados.
 */
function TrustLogosRow() {
  return (
    <div>
      <RowHeading>Instituciones con las que trabajamos</RowHeading>

      <ul className={GRID}>
        {TRUST_LOGOS.map((logo) => {
          const Icon = logo.icon;

          return (
            <li key={logo.key}>
              <div className="flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-edge bg-surface p-3 text-center shadow-[var(--shadow-card)] grayscale transition duration-300 hover:-translate-y-1 hover:border-brand/25 hover:grayscale-0">
                <span className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Icon className="size-5" />
                </span>
                <span className="text-[11px] leading-tight font-bold text-ink">{logo.label}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Fila 2 y 3: comparten estructura (icono + titulo + una linea). */
function CapabilityRow({
  title,
  items,
}: {
  title: string;
  items: readonly Capability[];
}) {
  return (
    <div>
      <RowHeading>{title}</RowHeading>

      <ul className={GRID}>
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <li key={item.key}>
              <div className="flex h-full flex-col gap-2.5 rounded-2xl border border-edge bg-surface p-4 shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-1 hover:border-brand/25">
                <span className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Icon className="size-5" />
                </span>
                <h4 className="text-sm font-bold text-brand">{item.title}</h4>
                <p className="text-[12px] leading-relaxed text-muted">{item.description}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Las 3 filas de cards que respaldan la propuesta de servicios. */
export function TrustCards() {
  return (
    <div className={cn("grid gap-12")}>
      <TrustLogosRow />
      <CapabilityRow title="Todo lo que necesita tu proyecto" items={PROJECT_CAPABILITIES} />
      <CapabilityRow title="Respaldo integral" items={INTEGRAL_SUPPORT} />
    </div>
  );
}
