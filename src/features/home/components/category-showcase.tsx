"use client";

import Link from "next/link";
import {
  ArrowRight,
  Construction,
  Hammer,
  HandCoins,
  House,
  KeyRound,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";

interface Category {
  slug: string;
  label: string;
  subtitle: string;
  href: string;
  Icon: LucideIcon;
}

const categories: readonly Category[] = [
  {
    slug: "comprar",
    label: "Comprar propiedad",
    subtitle: "Encuentra tu hogar ideal en Tumbes.",
    href: `${ROUTES.properties}?operation=buy`,
    Icon: House,
  },
  {
    slug: "proyectos",
    label: "Ver proyectos",
    subtitle: "Conoce nuestros desarrollos inmobiliarios.",
    href: ROUTES.projects,
    Icon: Construction,
  },
  {
    slug: "invertir",
    label: "Invertir con Ariz",
    subtitle: "Oportunidades con alta plusvalia.",
    href: ROUTES.investments,
    Icon: TrendingUp,
  },
  {
    slug: "vender",
    label: "Vender mi propiedad",
    subtitle: "Publica y vende con el mejor respaldo.",
    href: ROUTES.registerProfessional,
    Icon: HandCoins,
  },
  {
    slug: "construir",
    label: "Construir mi casa",
    subtitle: "Hacemos realidad tu proyecto.",
    href: ROUTES.construye,
    Icon: Hammer,
  },
  {
    slug: "alquilar",
    label: "Alquilar mi propiedad",
    subtitle: "Encuentra o publica en alquiler.",
    href: `${ROUTES.properties}?operation=rent`,
    Icon: KeyRound,
  },
];

const GRID =
  "horizontal-scrollbar-hidden mt-8 flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 sm:gap-4 lg:grid-cols-6";

function CategoryCard({ category, index }: { category: Category; index: number }) {
  const { Icon } = category;

  return (
    <li
      className="animate-[categoryFadeIn_700ms_ease-out_both]"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <Link
        href={category.href}
        aria-label={`${category.label}. ${category.subtitle}`}
        className={cn(
          "group flex h-[144px] w-[175px] shrink-0 flex-col rounded-[6px] border border-brand bg-brand px-5 pt-4 pb-3 shadow-[0_10px_24px_rgb(11_27_92_/_0.18)] transition duration-200 sm:h-[144px] sm:w-auto sm:px-5 sm:pt-4 sm:pb-3",
          "hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-[0_14px_28px_rgb(11_27_92_/_0.22)]",
          "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
        )}
      >
        <span aria-hidden className="mb-2 grid size-7 place-items-center text-white">
          <Icon className="size-6" strokeWidth={2.6} />
        </span>

        <span className="min-w-0 text-center">
          <span className="mx-auto block max-w-[8.6rem] text-[14.5px] font-black leading-5 text-accent">
            {category.label}
          </span>
          <span className="mx-auto mt-1 block max-w-[8.8rem] text-[11px] font-semibold leading-4 text-white/85">
            {category.subtitle}
          </span>
        </span>

        <span
          aria-hidden
          className="mt-auto grid size-5 place-items-center rounded-full bg-white text-brand transition-colors duration-200 group-hover:bg-accent group-hover:text-on-accent"
        >
          <ArrowRight className="size-3" strokeWidth={2.4} />
        </span>
      </Link>
    </li>
  );
}

export interface CategoryShowcaseProps {
  /**
   * `"hero"` (por defecto): el buscador del hero se solapa sobre el borde
   * superior de esta sección, por eso reserva espacio en móvil.
   * `"section"`: hay una sección intermedia (promociones móviles) que ya
   * absorbe ese solape y aquí solo se necesita el espaciado normal.
   */
  topSpacing?: "hero" | "section";
}

export function CategoryShowcase({ topSpacing = "hero" }: CategoryShowcaseProps) {
  return (
    <section
      className={cn(
        "overflow-hidden bg-[#F3F4F8] pb-7 lg:pt-32",
        topSpacing === "hero" ? "pt-[180px] sm:pt-[190px]" : "pt-7 sm:pt-8",
      )}
    >
      <div className="mx-auto w-full px-3 sm:px-4 lg:px-5 xl:px-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[28px] font-black leading-none tracking-tight text-brand sm:text-[34px] lg:text-[40px]">
            ¿Qué quieres hacer hoy?
          </h2>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-bold text-muted sm:hidden">
              Desliza <span className="inline-block animate-bounce text-accent">→</span>
            </span>
            <p className="hidden pt-0.5 text-[11px] font-bold leading-none text-muted sm:block">
              Todo lo que necesitas en un solo lugar
            </p>
          </div>
        </div>

        <ul className={GRID}>
          {categories.map((category, index) => (
            <CategoryCard key={category.slug} category={category} index={index} />
          ))}
        </ul>
      </div>
    </section>
  );
}
