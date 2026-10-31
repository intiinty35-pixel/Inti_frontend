"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import { ROUTES } from "@/shared/config/routes";
import { HomeHeroBackground } from "@/features/home/components/home-hero-background";
import { HeroPromotions } from "@/features/home/components/hero-promotions";
import { HOME_HERO_IMAGES, HOME_HERO_INTERVAL_MS } from "@/features/home/config";
import type { CurrentPromotion } from "@/features/promotions/types";

interface HeroSlide {
  eyebrow: string;
  title: string;
  titleLine2: string;
  description: string;
}

/** Contenido de cada diapositiva del Hero, sincronizado con la imagen de fondo. */
const HERO_SLIDES: readonly HeroSlide[] = [
  {
    eyebrow: "Inmobiliaria Inti · Tumbes",
    title: "Tu próximo hogar",
    titleLine2: "empieza en Tumbes.",
    description:
      "Casas, departamentos, terrenos y proyectos con plusvalía. Compra, alquila o invierte con el respaldo de una inmobiliaria registrada.",
  },
  {
    eyebrow: "Proyectos Inti · Tumbes",
    title: "Invierte en desarrollos",
    titleLine2: "con alta plusvalía.",
    description:
      "Proyectos inmobiliarios diseñados para crecer junto a ti y tu familia, con entrega garantizada y plusvalía comprobada.",
  },
  {
    eyebrow: "Terrenos · Tumbes",
    title: "Tu terreno,",
    titleLine2: "tu futuro.",
    description:
      "Lotes residenciales y comerciales con ubicación estratégica, servicios cercanos y posibilidad de financiamiento.",
  },
  {
    eyebrow: "Asesoría Inmobiliaria · Tumbes",
    title: "Compra, vende o alquila",
    titleLine2: "con total confianza.",
    description:
      "Un equipo de expertos te acompaña en cada paso de tu operación inmobiliaria, desde la visita hasta la escritura pública.",
  },
] as const;

const HERO_OVERLAY =
  "linear-gradient(90deg, rgb(20 24 31 / 0.86) 0%, rgb(20 24 31 / 0.66) 32%, rgb(20 24 31 / 0.22) 52%, rgb(20 24 31 / 0.04) 68%, rgb(20 24 31 / 0) 82%), linear-gradient(180deg, rgb(0 0 0 / 0.12) 0%, rgb(0 0 0 / 0.01) 54%, rgb(0 0 0 / 0.14) 100%)";

const HERO_OVERLAY_MOBILE =
  "linear-gradient(180deg, rgb(20 24 31 / 0.45) 0%, rgb(20 24 31 / 0.3) 50%, rgb(20 24 31 / 0.5) 100%)";

/**
 * Hero del home con fondo y contenido sincronizados.
 *
 * Cada 5 segundos cambia la imagen de fondo y, al mismo tiempo, el titular y
 * la descripción se actualizan para hablar de esa misma diapositiva.
 * El acceso de búsqueda se mantiene debajo del header, en su propio modal.
 */
export function HomeHeroClient({ promotions }: { promotions: CurrentPromotion[] }) {
  const total = HOME_HERO_IMAGES.length;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % total),
      HOME_HERO_INTERVAL_MS,
    );
    return () => window.clearInterval(timer);
  }, [total]);

  const slide = HERO_SLIDES[index];

  return (
    <>
      <HomeHeroBackground activeIndex={index} />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 lg:hidden"
        style={{ backgroundImage: HERO_OVERLAY_MOBILE }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 hidden lg:block"
        style={{ backgroundImage: HERO_OVERLAY }}
      />
      <HeroPromotions promotions={promotions} />
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-accent" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center lg:items-start">
        <div key={index} className="hero-copy-arrive flex min-h-[12rem] w-full flex-col items-center gap-2 text-center sm:min-h-[13rem] lg:min-h-[15rem] lg:w-[54%] lg:items-start lg:text-left">
          <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
            {slide.eyebrow}
          </p>
          <h1 className="mt-2 max-w-[42rem] font-display text-4xl leading-[1.04] font-bold tracking-tight text-white text-balance sm:text-5xl lg:text-[4.25rem]">
            <span className="block">{slide.title}</span>
            <span className="block text-accent">{slide.titleLine2}</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/85 sm:text-base sm:leading-7">
            {slide.description}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link href={`${ROUTES.properties}?operation=buy`} className="inline-flex h-11 items-center justify-center rounded-lg bg-accent px-5 text-sm font-bold text-brand transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              Explorar propiedades
            </Link>
            <Link href={ROUTES.projects} className="inline-flex h-11 items-center justify-center rounded-lg border border-white/45 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              Conocer proyectos
            </Link>
          </div>
        </div>

      </div>

      {/* Indicadores anclados al Hero: no se desplazan cuando cambia el texto. */}
      <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 items-center justify-center gap-2">
        {HOME_HERO_IMAGES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Ir a diapositiva ${i + 1}`}
            aria-current={i === index ? "true" : undefined}
            className={cn(
              "h-2 rounded-full transition-[width,background-color,transform] duration-300",
              i === index ? "w-6 scale-100 bg-white" : "w-2 scale-90 bg-white/45 hover:bg-white/80",
            )}
          />
        ))}
      </div>
    </>
  );
}
