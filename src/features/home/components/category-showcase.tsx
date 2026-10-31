"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Construction,
  Hammer,
  HandCoins,
  House,
  KeyRound,
  Pause,
  Play,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ROUTES } from "@/shared/config/routes";
import styles from "./category-showcase.module.css";

interface Category {
  slug: string;
  label: string;
  subtitle: string;
  href: string;
  Icon: LucideIcon;
}

const categories: readonly Category[] = [
  { slug: "comprar", label: "Comprar propiedad", subtitle: "Encuentra tu hogar ideal en Tumbes.", href: `${ROUTES.properties}?operation=buy`, Icon: House },
  { slug: "proyectos", label: "Ver proyectos", subtitle: "Conoce nuestros desarrollos inmobiliarios.", href: ROUTES.projects, Icon: Construction },
  { slug: "invertir", label: "Invertir con Inti", subtitle: "Oportunidades con alta plusvalía.", href: ROUTES.investments, Icon: TrendingUp },
  { slug: "vender", label: "Vender mi propiedad", subtitle: "Publica y vende con el mejor respaldo.", href: ROUTES.registerProfessional, Icon: HandCoins },
  { slug: "construir", label: "Construir mi casa", subtitle: "Hacemos realidad tu proyecto.", href: ROUTES.construye, Icon: Hammer },
  { slug: "alquilar", label: "Alquilar mi propiedad", subtitle: "Encuentra o publica en alquiler.", href: `${ROUTES.properties}?operation=rent`, Icon: KeyRound },
];

function CategoryCard({ category, decorative = false }: { category: Category; decorative?: boolean }) {
  const { label, subtitle, href, Icon } = category;
  const cardClass = "group flex min-h-[142px] w-[min(44vw,12rem)] shrink-0 flex-col items-center justify-center border border-edge bg-white px-3 py-4 text-center transition-colors duration-200 hover:border-brand/35 hover:bg-[#fbfaf7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:min-h-[180px] sm:w-[min(48vw,19rem)] sm:max-w-[22rem] sm:px-5 sm:py-6 sm:focus-visible:outline-offset-4 lg:w-[26vw]";
  const content = (
    <>
      <span className="grid size-8 place-items-center border border-accent text-brand transition-colors group-hover:bg-accent/10 sm:size-11">
        <Icon className="size-4 sm:size-[18px]" strokeWidth={1.8} />
      </span>
      <h3 className="mt-2.5 text-[10px] leading-snug font-semibold uppercase tracking-[0.02em] text-brand sm:mt-4 sm:text-sm sm:tracking-[0.04em]">{label}</h3>
      <p className="mt-1 max-w-[15rem] text-[9px] leading-relaxed text-muted sm:mt-2 sm:text-xs">{subtitle}</p>
    </>
  );

  if (decorative) return <Link href={href} tabIndex={-1} aria-hidden="true" className={cardClass}>{content}</Link>;
  return <Link href={href} aria-label={`${label}. ${subtitle}`} className={cardClass}>{content}</Link>;
}

export function CategoryShowcase() {
  const [isPaused, setIsPaused] = useState(false);
  const rows = [categories.slice(0, 3), categories.slice(3, 6)] as const;

  return (
    <section className="overflow-hidden bg-white py-10 sm:py-12 lg:py-14" aria-labelledby="category-showcase-title">
      <div className="mx-auto w-full max-w-[84rem] px-4 sm:px-6">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand/65">Servicios inmobiliarios</p>
          <h2 id="category-showcase-title" className="mt-2 font-display text-balance text-2xl font-bold uppercase leading-tight tracking-[0.04em] text-brand sm:text-3xl sm:tracking-[0.06em] lg:text-4xl">
            ¿Qué quieres hacer hoy?
          </h2>
          <span aria-hidden="true" className="mx-auto mt-4 block h-0.5 w-14 rounded-full bg-accent" />
        </header>

        <div className="mt-6 flex justify-center sm:mt-8">
          <button
            type="button"
            onClick={() => setIsPaused((paused) => !paused)}
            aria-pressed={isPaused}
            aria-label={isPaused ? "Reanudar movimiento de las tarjetas" : "Pausar movimiento de las tarjetas"}
            className={`${styles.controls} inline-flex min-h-9 items-center gap-2 rounded-full border border-edge px-3 text-[11px] font-semibold text-brand transition-colors hover:border-brand/40 hover:bg-[#fbfaf7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:min-h-10 sm:px-4 sm:text-xs`}
          >
            {isPaused ? <Play className="size-3.5" aria-hidden="true" /> : <Pause className="size-3.5" aria-hidden="true" />}
            {isPaused ? "Reanudar" : "Pausar"}
          </button>
        </div>

        <div className={`${styles.rows} ${isPaused ? styles.paused : ""} mt-6 sm:mt-7`}>
          {rows.map((row, rowIndex) => (
            <div className={styles.viewport} key={rowIndex}>
              <div className={`${styles.track} ${rowIndex === 0 ? styles.toRight : styles.toLeft}`}>
                <ul className={styles.group} aria-label={rowIndex === 0 ? "Opciones inmobiliarias, primera fila" : "Opciones inmobiliarias, segunda fila"}>
                  {row.map((category) => (
                    <li className={styles.item} key={category.slug}>
                      <CategoryCard category={category} />
                    </li>
                  ))}
                </ul>
                <div className={styles.group} aria-hidden="true">
                  {row.map((category) => (
                    <div className={styles.item} key={category.slug}>
                      <CategoryCard category={category} decorative />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
