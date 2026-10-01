import { BadgeCheck, Handshake, LineChart, MapPinned } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Reason {
  key: string;
  title: string;
  description: string;
  Icon: LucideIcon;
}

/** Los cuatro motivos por los que se compra o se publica con ARIZ. */
const REASONS: readonly Reason[] = [
  {
    key: "verificados",
    title: "Propiedades verificadas",
    description: "Revisamos fotos, datos y documentos antes de publicar cada anuncio.",
    Icon: BadgeCheck,
  },
  {
    key: "ubicacion",
    title: "Ubicación precisa",
    description: "Mapa, distrito y referencia exacta en cada inmueble del listado.",
    Icon: MapPinned,
  },
  {
    key: "valores",
    title: "Valores claros",
    description: "Precio, área y lotes siempre a la vista, sin letra chica.",
    Icon: LineChart,
  },
  {
    key: "acompanamiento",
    title: "Te acompañamos",
    description: "Un asesor de ARIZ te guía desde la búsqueda hasta la escritura.",
    Icon: Handshake,
  },
];

/** Foto del panel derecho. */
const SIDE_IMAGE = "/home/2.jpg";

/**
 * Banda de confianza que cierra la seccion de proyectos publicados.
 *
 * Va de esquina a esquina: nada de `Container` ni gutter, el panel azul y la
 * foto se reparten el ancho completo sin separacion entre ellos, asi que se leen
 * como una sola pieza. El azul degrada a la izquierda y la foto ocupa la quinta
 * parte de la derecha; el degradado sobre la foto por el lado izquierdo
 * disuelve el corte para que la union no se note.
 *
 * La foto es decorativa (los motivos ya explican la propuesta), asi que va
 * marcada como tal.
 */
export function WhyChooseArizSection() {
  return (
    <section aria-labelledby="por-que-elegir-ariz" className="w-full">
      {/* Sin `gap`: el panel y la foto quedan pegados. */}
      <div className="grid w-full items-stretch lg:grid-cols-[minmax(0,1fr)_20%]">
        <div className="bg-[linear-gradient(135deg,#2a3b85_0%,#00124f_100%)] px-6 py-10 sm:px-10 sm:py-12 lg:px-14">
          <h2
            id="por-que-elegir-ariz"
            className="text-2xl font-light tracking-tight text-white sm:text-3xl"
          >
            Por qué elegir Ariz
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75">
            Comprar con ARIZ significa comprar con datos verificados y el respaldo de un asesor
            que te acompaña hasta el final.
          </p>

          {/* Los cuatro motivos van en una sola fila a partir de `lg`. */}
          <ul className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
            {REASONS.map((reason) => {
              const Icon = reason.Icon;

              return (
                <li key={reason.key} className="flex gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-card border border-white/20 bg-white/10 text-[#F5B800]">
                    <Icon className="size-[22px]" strokeWidth={1.7} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white">{reason.title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-white/75">
                      {reason.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* El `min-h` en movil la mantiene visible cuando la rejilla se apila. */}
        <div className="relative min-h-[200px] overflow-hidden bg-[linear-gradient(135deg,#2a3b85_0%,#00124f_100%)] lg:min-h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SIDE_IMAGE}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover"
          />
          {/* Difumina el borde izquierdo para fundirse con el panel azul. */}
          <span
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(90deg,rgb(0_18_79_/_0.85)_0%,rgb(0_18_79_/_0.25)_38%,rgb(0_18_79_/_0.1)_100%)]"
          />
        </div>
      </div>
    </section>
  );
}