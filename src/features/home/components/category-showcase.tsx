"use client";

import { useState } from "react";
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
import { ArrowRightIcon } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { HomeSection } from "@/features/home/components/section";

interface Category {
  slug: string;
  label: string;
  subtitle: string;
  href: string;
  image: string;
  alt: string;
  /** Icono que resume la accion. */
  Icon: LucideIcon;
}

const imageParams = "?auto=format&fit=crop&w=800&q=80";

/**
 * Los seis caminos de entrada de ARIZ. Antes eran las categorias de inmueble;
 * ahora cada tarjeta es una accion (comprar, vender, invertir...) y el icono
 * marca la accion mientras la foto da el ambiente de cada una.
 */
const categories: readonly Category[] = [
  {
    slug: "comprar",
    label: "Comprar propiedad",
    subtitle: "Encuentra tu hogar ideal.",
    href: `${ROUTES.properties}?operation=buy`,
    image: `https://images.unsplash.com/photo-1600585154340-be6161a56a0c${imageParams}`,
    alt: "Casa moderna con jardin y fachada elegante al atardecer",
    Icon: House,
  },
  {
    slug: "proyectos",
    label: "Ver proyectos",
    subtitle: "Conoce nuestros desarrollos inmobiliarios.",
    href: ROUTES.projects,
    image: `https://images.unsplash.com/photo-1545324418-cc1a3fa10c00${imageParams}`,
    alt: "Edificio residencial moderno visto desde abajo",
    Icon: Construction,
  },
  {
    slug: "invertir",
    label: "Invertir con Ariz",
    subtitle: "Oportunidades con alta plusvalía.",
    href: `${ROUTES.properties}?operation=buy&type=projects`,
    image: `https://images.unsplash.com/photo-1500530855697-b586d89ba3ee${imageParams}`,
    alt: "Paisaje campestre verde con montanas y cielo despejado",
    Icon: TrendingUp,
  },
  {
    slug: "vender",
    label: "Vender mi propiedad",
    subtitle: "Publica y vende con el mejor respaldo.",
    href: ROUTES.registerProfessional,
    image: `https://images.unsplash.com/photo-1494526585095-c41746248156${imageParams}`,
    alt: "Interior luminoso de departamento con vista a la ciudad",
    Icon: HandCoins,
  },
  {
    slug: "construir",
    label: "Construir mi casa",
    subtitle: "Hacemos realidad tu proyecto.",
    href: ROUTES.services,
    image: `https://images.unsplash.com/photo-1503387762-592deb58ef4e${imageParams}`,
    alt: "Terreno amplio con cielo despejado y maquinaria de construccion",
    Icon: Hammer,
  },
  {
    slug: "alquilar",
    label: "Alquilar mi propiedad",
    subtitle: "Encuentra o publica en alquiler.",
    href: `${ROUTES.properties}?operation=rent`,
    image: `https://images.unsplash.com/photo-1441986300917-64674bd600d8${imageParams}`,
    alt: "Fachada de local comercial moderno en una avenida",
    Icon: KeyRound,
  },
];

/**
 * Rejilla de categorias: 6 columnas solo en `xl` (>=1280px). Antes entraban en
 * `lg` (1024px) y con el ancho de contenedor anterior las tarjetas quedaban por
 * debajo de 100px, demasiado finas para el texto. `gap-4` y `mt-8` les dan aire.
 */
const GRID = "mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6";

function CategoryCard({ category, index }: { category: Category; index: number }) {
  const [imageFailed, setImageFailed] = useState(false);
  const { Icon } = category;

  return (
    <li
      className="animate-[categoryFadeIn_700ms_ease-out_both]"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <Link
        href={category.href}
        aria-label={category.label}
        className={cn(
          "group relative flex h-40 overflow-hidden rounded-xl bg-[linear-gradient(135deg,#2a3b85_0%,#0B1B5C_100%)] p-3.5 shadow-[0_10px_28px_rgb(11_27_92_/_0.14)] transition duration-500 ease-out sm:h-44 lg:h-48",
          "hover:-translate-y-1.5 hover:shadow-[0_24px_55px_rgb(11_27_92_/_0.22)]",
          "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5B800]",
        )}
      >
        {!imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={category.image}
            alt={category.alt}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        ) : null}
        <span className="absolute inset-0 bg-[linear-gradient(180deg,rgb(11_27_92_/_0)_0%,rgb(11_27_92_/_0.85)_78%)] transition-colors duration-500 group-hover:bg-[linear-gradient(180deg,rgb(11_27_92_/_0.08)_0%,rgb(11_27_92_/_0.92)_78%)]" />

        {/*
          Icono de la accion. Va arriba a la izquierda con el mismo cristal y el
          mismo viraje a amarillo que la flecha de abajo a la derecha: los dos
          elementos de esquina comparten el mismo lenguaje visual.
        */}
        <span
          aria-hidden
          className="absolute top-3.5 left-3.5 z-10 grid size-9 place-items-center rounded-xl border border-white/45 bg-white/12 text-white backdrop-blur-sm transition-colors duration-300 group-hover:border-[#F5B800] group-hover:bg-[#F5B800] group-hover:text-[#0B1B5C]"
        >
          <Icon className="size-[18px]" strokeWidth={1.9} />
        </span>

        <span className="relative z-10 mt-auto min-w-0 pr-9">
          <span className="block text-base font-bold text-white">{category.label}</span>
          <span className="mt-1 block h-0.5 w-7 bg-[#F5B800] transition-all duration-300 group-hover:w-12" />
          <span className="mt-1 block text-[11px] font-medium leading-4 text-white/80">
            {category.subtitle}
          </span>
        </span>
        <span
          aria-hidden
          className="absolute bottom-3 right-3 z-10 grid size-6 place-items-center rounded-full border border-white/45 bg-white/12 text-sm font-bold text-white transition-colors duration-300 group-hover:border-[#F5B800] group-hover:bg-[#F5B800] group-hover:text-[#0B1B5C]"
        >
          <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </Link>
    </li>
  );
}

export function CategoryShowcase() {
  return (
    <HomeSection className="overflow-hidden bg-[#F3F4F8]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[11px] font-bold tracking-[0.18em] text-[#F5B800] uppercase">
            QUÉ HACEMOS POR TI
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-[#0B1B5C] sm:text-4xl">
            Explora propiedades
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#6B7280]">
            Compra, vende, invierte o construye con ARIZ. Elige cómo quieres empezar.
          </p>
        </div>
        <div className="pb-1">
          <Link
            href={ROUTES.properties}
            className="group flex shrink-0 items-center gap-2 text-sm font-bold text-brand transition-colors hover:text-[#0B1B5C]"
          >
            Ver todas
            <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <ul className={GRID}>
        {categories.map((category, index) => (
          <CategoryCard key={category.slug} category={category} index={index} />
        ))}
      </ul>
    </HomeSection>
  );
}
