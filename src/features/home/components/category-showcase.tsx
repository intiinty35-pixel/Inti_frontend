"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import type { PropertyType } from "@/features/listings/types/listing";
import { HomeSection } from "@/features/home/components/section";

interface Category {
  slug: PropertyType;
  label: string;
  subtitle: string;
  href: string;
  image: string;
  alt: string;
}

const imageParams = "?auto=format&fit=crop&w=800&q=80";

const categories: readonly Category[] = [
  {
    slug: "houses",
    label: "Casas",
    subtitle: "Fachadas modernas y jardines",
    href: `${ROUTES.properties}?operation=buy&type=houses`,
    image: `https://images.unsplash.com/photo-1600585154340-be6161a56a0c${imageParams}`,
    alt: "Casa moderna con jardin y fachada elegante al atardecer",
  },
  {
    slug: "apartments",
    label: "Departamentos",
    subtitle: "Vistas urbanas y espacios luminosos",
    href: `${ROUTES.properties}?operation=buy&type=apartments`,
    image: `https://images.unsplash.com/photo-1494526585095-c41746248156${imageParams}`,
    alt: "Interior luminoso de departamento con vista a la ciudad",
  },
  {
    slug: "projects",
    label: "Proyectos",
    subtitle: "Edificios y preventas seleccionadas",
    href: "/proyectos",
    image: `https://images.unsplash.com/photo-1545324418-cc1a3fa10c00${imageParams}`,
    alt: "Edificio residencial moderno visto desde abajo",
  },
  {
    slug: "land",
    label: "Terrenos",
    subtitle: "Lotes amplios para invertir",
    href: `${ROUTES.properties}?operation=buy&type=land`,
    image: `https://images.unsplash.com/photo-1503387762-592deb58ef4e${imageParams}`,
    alt: "Terreno amplio con cielo despejado y maquinaria de construccion",
  },
  {
    slug: "country-lots",
    label: "Lotes campestres",
    subtitle: "Campo, verde y aire abierto",
    href: `${ROUTES.properties}?operation=buy&type=country-lots`,
    image: `https://images.unsplash.com/photo-1500530855697-b586d89ba3ee${imageParams}`,
    alt: "Paisaje campestre verde con montanas y cielo despejado",
  },
  {
    slug: "commercial",
    label: "Locales comerciales",
    subtitle: "Ubicaciones para negocios",
    href: `${ROUTES.properties}?operation=buy&type=commercial`,
    image: `https://images.unsplash.com/photo-1441986300917-64674bd600d8${imageParams}`,
    alt: "Fachada de local comercial moderno en una avenida",
  },
];

function CategoryCard({ category, index }: { category: Category; index: number }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <li
      className="animate-[categoryFadeIn_700ms_ease-out_both]"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <Link
        href={category.href}
        aria-label={`Ver ${category.label.toLowerCase()} en ARIZ`}
        className={cn(
          "group relative flex h-28 min-w-[44vw] snap-start overflow-hidden rounded-xl bg-[linear-gradient(135deg,#2a3b85_0%,#0B1B5C_100%)] p-3 shadow-[0_10px_28px_rgb(11_27_92_/_0.14)] transition duration-500 ease-out sm:h-32",
          "hover:-translate-y-1.5 hover:shadow-[0_24px_55px_rgb(11_27_92_/_0.22)]",
          "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5B800]",
          "sm:min-w-0",
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
        <span className="relative z-10 mt-auto min-w-0 pr-9">
          <span className="block text-base font-bold text-white">{category.label}</span>
          <span className="mt-1 block h-0.5 w-7 bg-[#F5B800] transition-all duration-300 group-hover:w-12" />
          <span className="mt-1 block truncate text-[11px] font-medium leading-4 text-white/80">
            {category.subtitle}
          </span>
        </span>
        <span
          aria-hidden
          className="absolute bottom-3 right-3 z-10 grid size-6 place-items-center rounded-full border border-white/45 bg-white/12 text-sm font-bold text-white transition-colors duration-300 group-hover:border-[#F5B800] group-hover:bg-[#F5B800] group-hover:text-[#0B1B5C]"
        >
          →
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
            CATEGORÍAS
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-[#0B1B5C] sm:text-4xl">
            Explora propiedades
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#6B7280]">
            Elige el tipo de inmueble y descubre opciones con todos los detalles que necesitas.
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

      <ul className="mt-8 flex snap-x gap-4 overflow-x-auto scroll-smooth pb-4 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 lg:grid-cols-6">
        {categories.map((category, index) => (
          <CategoryCard key={category.slug} category={category} index={index} />
        ))}
      </ul>
    </HomeSection>
  );
}
