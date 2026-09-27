import Link from "next/link";
import { ArrowRightIcon } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { cloudinaryImage } from "@/shared/lib/cloudinary";
import type { PropertyType } from "@/features/listings/types/listing";
import { HomeSection, SectionHeading } from "@/features/home/components/section";

interface Category {
  slug: PropertyType;
  label: string;
  image: string;
}

const CATEGORIES: readonly Category[] = [
  { slug: "houses", label: "Casas", image: cloudinaryImage("ariz/categories/houses", "f_auto,q_auto,c_fill,w_520,h_650") },
  { slug: "apartments", label: "Departamentos", image: cloudinaryImage("ariz/categories/apartments", "f_auto,q_auto,c_fill,w_520,h_650") },
  { slug: "projects", label: "Proyectos", image: cloudinaryImage("ariz/categories/projects", "f_auto,q_auto,c_fill,w_520,h_650") },
  { slug: "land", label: "Terrenos", image: cloudinaryImage("ariz/categories/land", "f_auto,q_auto,c_fill,w_520,h_650") },
  { slug: "country-lots", label: "Lotes campestres", image: cloudinaryImage("ariz/categories/country-lots", "f_auto,q_auto,c_fill,w_520,h_650") },
  { slug: "commercial", label: "Locales comerciales", image: cloudinaryImage("ariz/categories/commercial", "f_auto,q_auto,c_fill,w_520,h_650") },
];

const FALLBACK = "linear-gradient(135deg, #2a3b85 0%, #00124f 100%)";
const OVERLAY = "linear-gradient(0deg, rgb(0 18 79 / 0.8) 0%, rgb(0 18 79 / 0) 58%)";

function background(category: Category): string {
  return [OVERLAY, `url(${category.image})`, FALLBACK].join(", ");
}

export function CategoryShowcase() {
  return (
    <HomeSection>
      <SectionHeading
        title="Explora propiedades"
        description="Elige el tipo de inmueble y descubre opciones con todos los detalles que necesitas."
        action={
          <Link
            href={ROUTES.search({ operation: "buy", type: "all" })}
            className="flex shrink-0 items-center gap-2 text-xs font-bold text-brand"
          >
            Ver todas
            <ArrowRightIcon className="size-4" />
          </Link>
        }
      />

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map((category) => (
          <li key={category.slug}>
            <Link
              href={ROUTES.search({ operation: "buy", type: category.slug })}
              className={cn(
                "group flex aspect-[4/5] items-end rounded-xl border border-brand bg-cover bg-center p-3 transition-transform hover:-translate-y-0.5",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              )}
              style={{ backgroundImage: background(category) }}
            >
              <span className="text-sm font-bold text-white">{category.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}
