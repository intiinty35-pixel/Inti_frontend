import { BadgeCheck, Handshake, LineChart, MapPinned, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Reason {
  key: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  backPoints: readonly string[];
}

const CARD_POSITIONS = [
  "xl:col-start-1 xl:col-span-2",
  "xl:col-start-3 xl:col-span-2",
  "xl:col-start-5 xl:col-span-2",
  "xl:col-start-2 xl:col-span-2",
  "xl:col-start-4 xl:col-span-2",
];

const REASONS: readonly Reason[] = [
  {
    key: "verificados",
    title: "Propiedades verificadas",
    description: "Revisamos fotos, datos y documentos antes de publicar cada anuncio.",
    Icon: BadgeCheck,
    backPoints: [
      "Documentación revisada antes de publicar.",
      "Fotos y medidas reales del inmueble.",
      "Datos de contacto del anunciante al alcance.",
    ],
  },
  {
    key: "ubicacion",
    title: "Ubicación precisa",
    description: "Mapa, distrito y referencia exacta en cada inmueble del listado.",
    Icon: MapPinned,
    backPoints: [
      "Coordenadas exactas y distrito señalado.",
      "Referencia clara en cada anuncio.",
      "Abre la ubicación directo en el mapa.",
    ],
  },
  {
    key: "valores",
    title: "Valores claros",
    description: "Precio, área y lotes siempre a la vista, sin letra chica.",
    Icon: LineChart,
    backPoints: [
      "Precio total y área siempre a la vista.",
      "Condiciones y gastos explicados.",
      "Asesoría para financiamiento disponible.",
    ],
  },
  {
    key: "acompanamiento",
    title: "Te acompañamos",
    description: "Un asesor de INTI te guía desde la búsqueda hasta la escritura.",
    Icon: Handshake,
    backPoints: [
      "Asesor dedicado desde la búsqueda.",
      "Apoyo en visitas y trámites.",
      "Acompañamiento hasta la firma.",
    ],
  },
  {
    key: "seguridad",
    title: "Inmobiliaria registrada",
    description: "Operamos con registro inmobiliario para brindarte respaldo y confianza.",
    Icon: ShieldCheck,
    backPoints: [
      "Codigo de agencia inmobiliaria N.º 02407-PJ-MVCS.",
      "Atencion responsable en cada operacion.",
      "Procesos orientados a seguridad y transparencia.",
    ],
  },
];

/** Tarjeta informativa fija, legible sin interacción. */
function ReasonCard({ reason, index }: { reason: Reason; index: number }) {
  const Icon = reason.Icon;

  return (
    <li className={`group relative flex min-h-[190px] flex-col overflow-hidden rounded-3xl border border-white bg-white p-4 shadow-[0_12px_34px_rgb(11_27_92_/_0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_46px_rgb(11_27_92_/_0.12)] sm:min-h-[230px] sm:p-7 ${CARD_POSITIONS[index]}`}>
      <span aria-hidden className="pointer-events-none absolute -right-7 -top-8 size-28 rounded-full bg-accent/10 transition-transform duration-500 group-hover:scale-125" />
      <div className="relative flex items-center justify-between">
        <span className="grid size-12 place-items-center rounded-2xl bg-brand text-accent"><Icon className="size-5" strokeWidth={1.8} /></span>
        <span className="font-display text-4xl font-semibold tabular-nums text-brand/10">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <h3 className="relative mt-5 font-display text-lg font-bold leading-tight text-brand">{reason.title}</h3>
      <p className="relative mt-2 text-sm leading-relaxed text-muted">{reason.description}</p>
      <p className="relative mt-auto flex items-start gap-2 border-t border-edge pt-4 text-xs leading-relaxed text-brand/75">
        <BadgeCheck className="mt-0.5 size-4 shrink-0 text-accent" />{reason.backPoints[0]}
      </p>
    </li>
  );
}

export function WhyChooseArizSection() {
  return (
    <section aria-labelledby="por-que-elegir-ariz" className="relative isolate w-full overflow-hidden bg-[#f7f6f2] py-10 sm:py-20 lg:py-24">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 -z-10 size-[32rem] -translate-x-1/2 rounded-full bg-white/70 blur-3xl" />
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand/60">Confianza que se construye</p>
          <h2 id="por-que-elegir-ariz" className="mt-2 font-display text-2xl font-bold tracking-tight text-brand sm:text-4xl lg:text-5xl">
            Por qué elegir Inti
          </h2>
          <span aria-hidden="true" className="mx-auto mt-4 block h-0.5 w-14 rounded-full bg-accent" />
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Comprar con INTI significa contar con información clara y un asesor que te acompaña en cada paso.
          </p>
        </header>
        <ul className="mt-7 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:mt-14 xl:grid-cols-6 xl:gap-5">
          {REASONS.map((reason, index) => (
            <ReasonCard key={reason.key} reason={reason} index={index} />
          ))}
        </ul>
        <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-2xl border border-brand/10 bg-white/75 px-4 py-3 text-center shadow-sm sm:mt-10 sm:px-5 sm:py-4">
          <ShieldCheck className="size-5 text-brand" />
          <span className="text-xs font-semibold text-brand">Inmobiliaria registrada ante el MVCS</span>
          <span className="hidden h-4 w-px bg-edge sm:block" />
          <span className="text-xs text-muted">Código N.º 02407-PJ-MVCS</span>
        </div>
      </div>
    </section>
  );
}
