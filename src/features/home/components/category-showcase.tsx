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
    href: `${ROUTES.properties}?operation=buy&type=projects`,
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
    href: ROUTES.services,
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
          "group flex h-[144px] w-[175px] shrink-0 flex-col rounded-[6px] border border-[#E9EDF5] bg-white px-5 pt-4 pb-3 shadow-[0_6px_16px_rgb(13_32_80_/_0.045)] transition-colors duration-200 sm:w-auto sm:h-[144px] sm:px-5 sm:pt-4 sm:pb-3",
          "hover:border-[#F5B800]/60 hover:shadow-[0_8px_18px_rgb(13_32_80_/_0.07)]",
          "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5B800]",
        )}
      >
        <span aria-hidden className="mb-2 grid size-7 place-items-center text-[#F5B800]">
          <Icon className="size-6" strokeWidth={2.6} fill="currentColor" fillOpacity={0.18} />
        </span>

        <span className="min-w-0 text-center">
          <span className="mx-auto block max-w-[8.6rem] text-[14.5px] leading-5 font-black text-[#071A5A]">
            {category.label}
          </span>
          <span className="mx-auto mt-1 block max-w-[8.8rem] text-[11px] leading-4 font-semibold text-[#596273]">
            {category.subtitle}
          </span>
        </span>

        <span
          aria-hidden
          className="mt-auto grid size-5 place-items-center rounded-full bg-[#F4F6FA] text-[#071A5A] transition-colors duration-200 group-hover:bg-[#F5B800]"
        >
          <ArrowRight className="size-3" strokeWidth={2.4} />
        </span>
      </Link>
    </li>
  );
}

export function CategoryShowcase() {
  return (
    <section className="overflow-hidden bg-[#F3F4F8] pt-[180px] pb-7 sm:pt-[190px] lg:pt-32">
      <div className="mx-auto w-full px-3 sm:px-4 lg:px-5 xl:px-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[21.6px] leading-none font-black tracking-tight text-[#071A5A] sm:text-[24px]">
            ¿Qué quieres hacer hoy?
          </h2>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-bold text-[#596273] sm:hidden">
              Desliza <span className="inline-block animate-bounce text-[#F5B800]">→</span>
            </span>
            <p className="hidden pt-0.5 text-[11px] leading-none font-bold text-[#596273] sm:block">
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
