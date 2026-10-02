"use client";

import { useState } from "react";
import { BadgeCheck, Handshake, LineChart, MapPinned } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@/shared/ui";

interface Reason {
  key: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  /** Contenido de la cara trasera (que se ve al girar la card). */
  backTitle: string;
  backPoints: readonly string[];
}

/** Los cuatro motivos por los que se compra o se publica con ARIZ. */
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
      className="h-[300px] w-full text-left rounded-[8px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
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
          className="absolute inset-0 flex flex-col rounded-[8px] border border-edge bg-surface p-5 shadow-sm"
          style={backfaceVisibility}
        >
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-[6px] bg-accent/15 text-accent">
            <Icon className="size-[22px]" strokeWidth={1.8} />
          </span>

          <div className="mt-4">
            <h3 className="text-base font-black tracking-tight text-[#071A5A]">{reason.title}</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-[#596273]">{reason.description}</p>
          </div>

          <span className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-bold text-brand">
            Toca para descubrir más
            <Icon className="size-3.5" strokeWidth={2.2} />
          </span>
        </div>

        {/* Cara trasera */}
        <div
          className="absolute inset-0 flex flex-col rounded-[8px] bg-brand p-5 text-white shadow-[var(--shadow-pop)]"
          style={{ ...backfaceVisibility, transform: "rotateY(180deg)" }}
        >
          <p className="text-[10px] font-bold tracking-[0.16em] text-accent uppercase">
            Dato útil
          </p>
          <h3 className="mt-1 text-lg font-black tracking-tight text-white">{reason.backTitle}</h3>

          <ul className="mt-3 flex flex-col gap-2.5">
            {reason.backPoints.map((point) => (
              <li key={point} className="flex items-start gap-2 text-[13px] leading-snug text-white/90">
                <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                {point}
              </li>
            ))}
          </ul>

          <span className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-bold text-white/80">
            Volver
          </span>
        </div>
      </div>
    </button>
  );
}

/** Sección de confianza en tonos claros, con los colores del sitio. */
export function WhyChooseArizSection() {
  return (
    <section aria-labelledby="por-que-elegir-ariz" className="bg-white py-12 sm:py-16">
      <Container size="wide-tight">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-x-8">
          <div>
            <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
              Confianza y respaldo
            </p>
            <h2
              id="por-que-elegir-ariz"
              className="mt-2 text-2xl leading-none font-black tracking-tight text-[#071A5A] sm:text-3xl"
            >
              Por qué elegir Ariz
            </h2>
          </div>

          <p className="text-sm leading-relaxed font-bold text-[#596273] lg:pb-0.5">
            Comprar con ARIZ significa comprar con datos verificados y el respaldo de un asesor
            que te acompaña hasta el final.
          </p>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((reason) => (
            <li key={reason.key}>
              <FlipReasonCard reason={reason} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}