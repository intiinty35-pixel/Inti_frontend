import Link from "next/link";
import { WhatsappIcon } from "@/shared/ui";
import { buildArizWhatsappUrl } from "@/shared/lib/whatsapp";

export type UnlimitedPlanUserType = "USER" | "REAL_ESTATE";

export interface UnlimitedPlanCardProps {
  customerName: string;
  userType: UnlimitedPlanUserType;
}

export function UnlimitedPlanCard({ customerName, userType }: UnlimitedPlanCardProps) {
  const baseMessage =
    userType === "USER"
      ? `Hola INTI, soy ${customerName}. Estoy interesado en el Plan Ilimitado para publicar propiedades sin límite. ¿Podrían cotizar?`
      : `Hola INTI, soy ${customerName}. Como agente/inmobiliaria estoy interesado en el Plan Ilimitado para publicar propiedades sin límite. ¿Podrían cotizar?`;

  const whatsappUrl = buildArizWhatsappUrl(baseMessage);

  return (
    <div className="relative flex min-h-80 flex-col overflow-hidden rounded-card border-2 border-amber-400/60 bg-gradient-to-br from-amber-50 via-white to-amber-50 text-left shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)] dark:from-amber-950/20 dark:via-surface dark:to-amber-950/20">
      <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400" aria-hidden />
      
      <span className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 px-3 py-1 text-[10px] font-black tracking-wide text-white shadow-lg">
        PLAN ILIMITADO
      </span>

      <div className="flex flex-1 flex-col items-center gap-4 p-5 pt-10 text-center">
        <span className="font-display text-7xl font-black tracking-tight text-amber-500">
          ∞
        </span>
        <span className="font-display text-2xl font-black tracking-tight text-brand">
          ILIMITADO
        </span>
        <span className="text-sm font-semibold text-ink">
          Publica las propiedades que quieras
        </span>

        <div className="w-full rounded-card border-2 border-amber-300/50 bg-gradient-to-br from-amber-50 to-yellow-50 px-4 py-3 dark:from-amber-950/30 dark:to-yellow-950/20">
          <span className="block text-[11px] font-bold tracking-wide text-muted uppercase">
            Convenio directo
          </span>
          <span className="mt-1 block text-xl font-black text-amber-600">
            Cotiza con INTI Group
          </span>
        </div>

        <ul className="mt-auto flex w-full flex-col gap-2 text-left text-xs text-ink">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 size-3.5 shrink-0 rounded-full bg-accent" />
            <span>Sin límite de publicaciones</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 size-3.5 shrink-0 rounded-full bg-accent" />
            <span>Negociación directa con INTI</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 size-3.5 shrink-0 rounded-full bg-accent" />
            <span>Precio personalizado para ti</span>
          </li>
        </ul>

        <Link
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-card bg-[#25d366] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1fb857]"
        >
          <WhatsappIcon className="size-5" />
          Cotizar por WhatsApp
        </Link>
      </div>
    </div>
  );
}
