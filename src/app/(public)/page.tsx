import { Suspense } from "react";
import Link from "next/link";
import { ArrowRightIcon, Container } from "@/shared/ui";
import { SearchForm } from "@/features/search";
import { ROUTES } from "@/shared/config/routes";
import { buildMetadata } from "@/shared/lib/seo";

export const metadata = buildMetadata({
  title: "Ariz Proyectos — Casas, departamentos y terrenos en Perú",
  description:
    "Portal inmobiliario para encontrar casas, departamentos, terrenos y proyectos en Perú.",
  path: "/",
});

const HERO_BACKGROUND = [
  "linear-gradient(180deg, rgb(0 18 79 / 0.45), rgb(0 18 79 / 0.78))",
  "url(/images/hero.jpg)",
  "linear-gradient(135deg, #1a2a6c 0%, #00124f 55%, #000a2e 100%)",
].join(", ");

const CATEGORIES = [
  { slug: "houses", label: "Casas" },
  { slug: "apartments", label: "Departamentos" },
  { slug: "projects", label: "Proyectos" },
  { slug: "land", label: "Terrenos" },
  { slug: "country-lots", label: "Lotes campestres" },
] as const;

function categoryBackground(slug: string) {
  return [
    "linear-gradient(0deg, rgb(0 18 79 / 0.8) 0%, rgb(0 18 79 / 0) 55%)",
    `url(/images/categories/${slug}.jpg)`,
    "linear-gradient(135deg, #2a3b85, #00124f)",
  ].join(", ");
}

function SearchFormFallback() {
  return <div className="h-[178px] w-full rounded-2xl bg-surface" />;
}

export default function PublicHomePage() {
  return (
    <>
      <section
        className="bg-cover bg-center px-4 pt-20 pb-14 text-center text-white sm:px-6"
        style={{ backgroundImage: HERO_BACKGROUND }}
      >
        <div className="mx-auto flex max-w-[942px] flex-col items-center">
          <p className="rounded-full border border-white/40 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold backdrop-blur-sm">
            Tu próximo espacio empieza aquí
          </p>
          <h1 className="mt-7 max-w-3xl text-4xl leading-[1.05] font-light tracking-tight sm:text-6xl">
            Encuentra el lugar que estás buscando
          </h1>
          <p className="mt-5 mb-14 max-w-xl text-base text-white/85 sm:text-lg">
            Compra, alquila o descubre proyectos inmobiliarios en un solo lugar.
          </p>
          <Suspense fallback={<SearchFormFallback />}>
            <SearchForm />
          </Suspense>
        </div>
      </section>

      <Container size="wide" className="py-14 sm:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-light tracking-tight text-brand sm:text-4xl">
              Explora propiedades
            </h2>
            <p className="mt-2 text-sm text-muted">
              Elige el tipo de inmueble y descubre opciones con todos los detalles que necesitas.
            </p>
          </div>
          <Link
            href={ROUTES.search({ operation: "buy", type: "all" })}
            className="flex shrink-0 items-center gap-2 text-xs font-bold text-brand"
          >
            Ver todas
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((category) => (
            <li key={category.slug}>
              <Link
                href={ROUTES.search({ operation: "buy", type: category.slug })}
                className="group flex aspect-[4/5] items-end rounded-xl border border-brand bg-cover bg-center p-4 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                style={{ backgroundImage: categoryBackground(category.slug) }}
              >
                <span className="text-sm font-bold text-white">{category.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
