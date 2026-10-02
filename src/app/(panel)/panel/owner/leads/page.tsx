import { ChatIcon, SparkleIcon } from "@/shared/ui";
import { OwnerPageHeader } from "@/app/(panel)/panel/owner/owner-shell";

const FEATURES = [
  "Todas tus consultas en una bandeja organizada por estado",
  "Historial de conversación con cada cliente",
  "Recordatorios de seguimiento para no perder una oportunidad",
];

export default function OwnerLeadsPage() {
  return (
    <div className="flex flex-col gap-6">
      <OwnerPageHeader eyebrow="Contactos" title="Leads y consultas" />

      <div className="relative overflow-hidden rounded-card border border-edge bg-[linear-gradient(180deg,#ffffff_0%,#f9fafc_100%)] p-8 text-center shadow-[var(--shadow-card)] sm:p-12">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-brand" aria-hidden />

        <div className="mx-auto flex max-w-xl flex-col items-center">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-brand text-on-brand">
            <ChatIcon className="size-8" />
          </span>

          <p className="mt-5 flex items-center gap-1.5 text-[11px] font-black tracking-[0.2em] text-accent uppercase">
            <SparkleIcon className="size-3.5" />
            En construcción
          </p>
          <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-brand sm:text-3xl">
            Se está creando el CRM
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Estamos construyendo un espacio dedicado para gestionar todas tus consultas y leads en
            un solo lugar. Muy pronto podrás darle seguimiento a cada contacto desde aquí.
          </p>

          <ul className="mt-6 flex w-full flex-col gap-2.5 text-left">
            {FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-3 rounded-card border border-edge bg-surface px-4 py-3 text-sm font-medium text-ink"
              >
                <span className="size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
