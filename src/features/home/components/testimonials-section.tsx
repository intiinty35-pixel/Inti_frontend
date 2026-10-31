"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@/shared/ui";
import { cn } from "@/shared/lib/cn";

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  /** 1 a 5 estrellas. La mayoría 5, algunos 4 (intermedios). */
  rating: number;
  avatar: string;
}

/**
 * Testimonios de clientes. `avatar` es una foto de red (i.pravatar.cc): se usa
 * con `<img>` plano para poder cargar avatares externos sin tocar la config de
 * next/image. Si un día tenemos retratos propios, solo hay que cambiar las URLs.
 */
const TESTIMONIALS: readonly Testimonial[] = [
  {
    name: "María Fernández",
    role: "Compró un departamento en Santa Cruz de la Sierra",
    quote:
      "Desde la primera visita hasta la firma todo fue transparente. El asesor me explicó cada costo y nunca sentí presión. Hoy disfruto mi departamento.",
    rating: 5,
    avatar: "https://i.pravatar.cc/140?img=47",
  },
  {
    name: "Carlos Mendoza",
    role: "Invirtió en un proyecto de lotes",
    quote:
      "Invertí en un lote con plusvalía real. La simulación de retorno que me mostraron se cumplió casi al pie de la letra. Totalmente recomendados.",
    rating: 5,
    avatar: "https://i.pravatar.cc/140?img=12",
  },
  {
    name: "Lucía Paredes",
    role: "Alquiló su casa con INTI",
    quote:
      "Publicar mi propiedad fue sencillo y en menos de dos semanas ya tenía visitas de buenos interesados. El equipo se encargó de la parte difícil.",
    rating: 5,
    avatar: "https://i.pravatar.cc/140?img=32",
  },
  {
    name: "Jorge Salazar",
    role: "Compró un terreno familiar",
    quote:
      "Buscamos terreno por mucho tiempo y INTI nos ubicó el ideal. Los papeles estaban claros y nos acompañaron hasta la notaría. Excelente experiencia.",
    rating: 5,
    avatar: "https://i.pravatar.cc/140?img=59",
  },
  {
    name: "Rosa Castillo",
    role: "Vendió su departamento",
    quote:
      "El proceso fue rápido y ordenado. Me mantuvieron informada en cada etapa y consiguieron un precio justo. Volvería a trabajar con ellos sin dudarlo.",
    rating: 5,
    avatar: "https://i.pravatar.cc/140?img=45",
  },
  {
    name: "Pedro Ramírez",
    role: "Inversionista en proyectos",
    quote:
      "Como inversionista valoro la seriedad. Los reportes son puntuales y las proyecciones, honestas. Una de las mejores decisiones que he tomado.",
    rating: 5,
    avatar: "https://i.pravatar.cc/140?img=33",
  },
  {
    name: "Ana Guzmán",
    role: "Compró por primera vez",
    quote:
      "Mi primera compra fue con INTI y me resolvieron todas las dudas. Lo único que desearía es más opciones de financiamiento, pero el resto fue perfecto.",
    rating: 4,
    avatar: "https://i.pravatar.cc/140?img=25",
  },
  {
    name: "Miguel Torres",
    role: "Alquiló local comercial",
    quote:
      "Encontré rápido un local en una buena zona. La atención fue cordial y el contrato, claro. Se echó en falta un poco más de acompañamiento al final.",
    rating: 4,
    avatar: "https://i.pravatar.cc/140?img=68",
  },
  {
    name: "Diana Flores",
    role: "Buscó casa con INTI",
    quote:
      "Me ayudaron a comparar zonas y me presentaron opciones que no encontraba en otros portales. El asesor fue muy paciente con todas mis preguntas.",
    rating: 5,
    avatar: "https://i.pravatar.cc/140?img=16",
  },
  {
    name: "Raúl Jiménez",
    role: "Inversionista en Santa Cruz de la Sierra",
    quote:
      "La información de mercado que comparten es muy útil para decidir. Compré dos lotes y el proceso se sintió seguro de principio a fin.",
    rating: 5,
    avatar: "https://i.pravatar.cc/140?img=11",
  },
];

const AUTOPLAY_MS = 6000;
/** Estrellas de 1 a 5, rellenas según el puntaje. */
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${rating} de 5 estrellas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-4",
            i < rating ? "fill-current text-[#F5B800]" : "text-edge",
          )}
          strokeWidth={2}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article className="flex h-full flex-col gap-4 rounded-card border border-edge bg-surface p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="size-14 shrink-0 rounded-full border border-edge object-cover shadow-[var(--shadow-card)]"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-ink">{testimonial.name}</p>
          <p className="truncate text-xs text-muted">{testimonial.role}</p>
        </div>
      </div>

      <Stars rating={testimonial.rating} />

      <p className="text-sm leading-relaxed text-ink/85">“{testimonial.quote}”</p>
    </article>
  );
}

/** Tarjetas visibles según el ancho de pantalla (1 móvil · 2 tablet · 3 desktop). */
function usePerView(): number {
  const [perView, setPerView] = useState(1);

  useEffect(() => {
    function update() {
      const width = window.innerWidth;
      setPerView(width >= 1024 ? 3 : width >= 768 ? 2 : 1);
    }

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return perView;
}

/** Botón circular de navegación del carrusel. */
function ArrowButton({
  Icon,
  onClick,
  label,
}: {
  Icon: LucideIcon;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-10 shrink-0 place-items-center rounded-full border border-edge bg-surface text-brand transition-colors hover:border-brand hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <Icon className="size-4" />
    </button>
  );
}
export function TestimonialsSection() {
  const perView = usePerView();
  const maxIndex = Math.max(0, TESTIMONIALS.length - perView);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // El indice deriva en render para que, si al encoger la pantalla deja de
  // encajar (menos tarjetas visibles), se muestre siempre el ultimo grupo valido
  // sin necesidad de sincronizarlo por efecto.
  const safeIndex = Math.min(index, maxIndex);

  // Avanza solo (carrusel), se pausa al pasar el mouse.
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current >= maxIndex ? 0 : current + 1));
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, maxIndex]);

  return (
    <section id="testimonios" className="bg-white py-12 sm:py-16">
      <Container size="wide-tight">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-x-10">
          <div>
            <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
              Testimonios
            </p>
            <h2 className="mt-2 text-2xl leading-none font-black tracking-tight text-[#082a6b] sm:text-3xl">
              Lo que dicen nuestros clientes
            </h2>
          </div>

          <div className="flex items-center gap-5">
            <p className="max-w-sm text-sm leading-relaxed font-bold text-[#596273] lg:text-right">
              Historias reales de quienes ya compraron, vendieron o invirtieron con INTI.
            </p>

            <div className="flex shrink-0 items-center gap-2">
              <ArrowButton
                Icon={ChevronLeft}
                label="Comentario anterior"
                onClick={() => setIndex((current) => (current - 1 + (maxIndex + 1)) % (maxIndex + 1))}
              />
              <ArrowButton
                Icon={ChevronRight}
                label="Siguiente comentario"
                onClick={() => setIndex((current) => (current + 1) % (maxIndex + 1))}
              />
            </div>
          </div>
        </div>

        <div
          className="mt-8 overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${safeIndex * (100 / perView)}%)` }}
          >
            {TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.name}
                className="shrink-0 px-3 py-1"
                style={{ width: `${100 / perView}%` }}
              >
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>
        </div>

        {/* Puntos de progreso */}
        <div className="mt-7 flex items-center justify-center gap-1.5">
          {Array.from({ length: maxIndex + 1 }).map((_, dot) => (
            <button
              key={dot}
              type="button"
              aria-label={`Ir al grupo ${dot + 1}`}
              onClick={() => setIndex(dot)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                dot === safeIndex ? "w-6 bg-brand" : "w-1.5 bg-edge hover:bg-muted",
              )}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
