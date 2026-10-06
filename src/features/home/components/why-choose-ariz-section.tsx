"use client";

import { useState } from "react";
import { BadgeCheck, Handshake, LineChart, MapPinned, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@/shared/ui";

interface Reason {
  key: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  backTitle: string;
  backPoints: readonly string[];
}

const REASONS: readonly Reason[] = [
  {
    key: "verificados",
    title: "Propiedades verificadas",
    description: "Revisamos fotos, datos y documentos antes de publicar cada anuncio.",
    Icon: BadgeCheck,
    backTitle: "Así lo verificamos",
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
    backTitle: "Ubícala sin dudas",
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
    backTitle: "Sin letra chica",
    backPoints: [
      "Precio total y área siempre a la vista.",
      "Condiciones y gastos explicados.",
      "Asesoría para financiamiento disponible.",
    ],
  },
  {
    key: "acompanamiento",
    title: "Te acompañamos",
    description: "Un asesor de ARIZ te guía desde la búsqueda hasta la escritura.",
    Icon: Handshake,
    backTitle: "Te guiamos en todo",
    backPoints: [
      "Asesor dedicado desde la búsqueda.",
      "Apoyo en visitas y trámites.",
      "Acompañamiento hasta la firma.",
    ],
  },
  {
    key: "seguridad",
    title: "Procesos seguros",
    description: "Cada operación se maneja con respaldo legal y pagos transparentes.",
    Icon: ShieldCheck,
    backTitle: "Opera con tranquilidad",
    backPoints: [
      "Contratos y documentación en regla.",
      "Pagos y reservas transparentes.",
      "Respaldo legal en cada operación.",
    ],
  },
];

/** Card que gira al hacer clic y muestra información útil en la cara trasera. */
function FlipReasonCard({ reason }: { reason: Reason }) {
  const [flipped, setFlipped] = useState(false);
  const Icon = reason.Icon;

  const backfaceVisibility = {
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
  } as const;

  return (
    <button
      type="button"
      onClick={() => setFlipped((value) => !value)}
      aria-pressed={flipped}
      title={flipped ? "Volver a ver el resumen" : "Ver más información"}
      className="h-[200px] w-full rounded-[8px] text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand sm:h-[245px]"
      style={{ perspective: "1400px" }}
    >
      <div
        className="relative h-full w-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Cara frontal */}
        <div
          className="absolute inset-0 flex min-w-0 flex-col rounded-[8px] border border-edge bg-surface p-3 shadow-sm sm:p-4"
          style={backfaceVisibility}
        >
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-[6px] bg-accent/15 text-accent">
            <Icon className="size-5" strokeWidth={1.8} />
          </span>

          <div className="mt-2.5 min-w-0">
            <h3 className="break-words text-sm leading-tight font-black tracking-tight text-[#071A5A] sm:text-base">
              {reason.title}
            </h3>
            <p className="mt-1 break-words text-[11px] leading-snug text-[#596273] sm:text-[12.5px] sm:leading-relaxed">
              {reason.description}
            </p>
          </div>

          <span className="mt-auto inline-flex min-w-0 items-center gap-1 pt-2.5 text-[10px] leading-tight font-bold text-brand sm:text-xs">
            Toca para descubrir más
            <Icon className="size-3.5 shrink-0" strokeWidth={2.2} />
          </span>
        </div>

        {/* Cara trasera */}
        <div
          className="absolute inset-0 flex flex-col rounded-[8px] bg-brand p-3.5 text-white shadow-[var(--shadow-pop)] sm:p-4"
          style={{ ...backfaceVisibility, transform: "rotateY(180deg)" }}
        >
          <p className="text-[10px] font-bold tracking-[0.16em] text-accent uppercase">
            Dato útil
          </p>
          <h3 className="mt-1 text-base font-black tracking-tight text-white sm:text-lg">{reason.backTitle}</h3>

          <ul className="mt-2 flex flex-col gap-1.5 sm:mt-2.5 sm:gap-2">
            {reason.backPoints.map((point) => (
              <li key={point} className="flex items-start gap-2 text-[11.5px] leading-snug text-white/90 sm:text-xs">
                <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                {point}
              </li>
            ))}
          </ul>

          <span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-bold text-white/80">
            Volver
          </span>
        </div>
      </div>
    </button>
  );
}

export function WhyChooseArizSection() {
  return (
    <section aria-labelledby="por-que-elegir-ariz" className="w-full bg-white py-12 sm:py-16">
      {/* Reemplazamos Container o removemos la restricción de max-width si quieres ancho completo */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-x-8">
          <div>
            <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
              Confianza y respaldo
            </p>
            <h2
              id="por-que-elegir-ariz"
              className="mt-2 max-w-full text-xl leading-tight font-black tracking-tight text-[#071A5A] text-balance sm:text-3xl"
            >
              Por qué elegir Ariz
            </h2>
          </div>

          <p className="text-sm leading-relaxed font-bold text-[#596273] lg:pb-0.5">
            Comprar con ARIZ significa comprar con datos verificados y el respaldo de un asesor
            que te acompaña hasta el final.
          </p>
        </div>
        <ul className="mt-5 grid grid-cols-1 gap-3 sm:mt-7 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
          {REASONS.map((reason) => (
            <li key={reason.key} className="w-full">
              <FlipReasonCard reason={reason} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}