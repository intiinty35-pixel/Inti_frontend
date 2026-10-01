import { Suspense } from "react";
import { SearchForm } from "@/features/search";
import {
  AccountCtaSection,
  ArizProjectsSection,
  CategoryShowcase,
  FeaturedListingsSection,
  HomeHeroBackground,
  MapExplorerSection,
  PublishedProjectsSection,
  WhyChooseArizSection,
} from "@/features/home";
import { buildMetadata } from "@/shared/lib/seo";

export const metadata = buildMetadata({
  title: "Ariz Proyectos — Casas, departamentos y terrenos en Perú",
  description:
    "Portal inmobiliario para encontrar casas, departamentos, terrenos y proyectos en Perú.",
  path: "/",
});

/**
 * Velo del hero, en dos capas:
 * - la horizontal tiñe de azul de marca desde la izquierda y se desvanece hacia
 *   la derecha, que es donde la foto queda limpia;
 * - la vertical solo apega el contraste del titulo arriba y del buscador abajo,
 *   con el centro casi libre para que la imagen se vea nitida.
 */
const HERO_OVERLAY = [
  "linear-gradient(180deg, rgb(0 0 0 / 0.18) 0%, rgb(0 0 0 / 0.02) 45%, rgb(0 0 0 / 0.14) 100%)",
  "linear-gradient(90deg, rgb(0 18 79 / 0.72) 0%, rgb(0 18 79 / 0.44) 46%, rgb(0 18 79 / 0.16) 100%)",
].join(", ");

/**
 * Ancho de la cabecera: el mismo tope que las secciones (`wide-tight`) para que
 * el titular, el filtro y las grillas queden alineados por el mismo canal.
 */
const HERO_SHELL = "mx-auto w-full max-w-[942px]";

function SearchFormFallback() {
  return <div className="h-[178px] w-full rounded-2xl bg-surface" />;
}

export default function PublicHomePage() {
  return (
    <>
      {/*
        Cabecera con las 4 fotos de `public/home/` como fondo en carrusel. El
        fondo cubre toda la seccion (titulo y filtro incluidos) y el velo
        garantiza que el texto se lea sobre cualquier foto.

        El fondo va en `absolute inset-0`, asi que el alto de la seccion lo
        mandan el padding y el contenido: subir el padding vertical agranda el
        hero y la foto se estiran juntos.

        El margen negativo sube el hero por debajo del header para que la foto
        del carrusel se vea detras de el, y el padding suma la altura del
        header (`--header-h`) para que el contenido no se mueva. Los dos se
        compensan: el bloque se ve igual, solo la foto gana los 105px de arriba.
      */}
      <section className="relative isolate overflow-visible -mt-[var(--header-h)] px-4 pt-[calc(var(--header-h)+5rem)] pb-12 text-center text-white sm:px-6 sm:pt-[calc(var(--header-h)+6.25rem)] sm:pb-14 lg:px-6 lg:pt-[calc(var(--header-h)+7rem)] xl:px-8">
        <HomeHeroBackground />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ backgroundImage: HERO_OVERLAY }}
        />
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-accent" />

        <div className={`${HERO_SHELL} flex flex-col items-center`}>
          <p className="rounded-full border border-white/40 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold backdrop-blur-sm">
            Tu próximo espacio empieza aquí
          </p>
          <h1 className="mt-7 max-w-5xl text-4xl leading-[1.05] font-light tracking-tight sm:text-6xl lg:text-7xl">
            Encuentra el lugar que estás buscando
          </h1>
          <p className="mt-5 mb-8 max-w-2xl text-base text-white/90 sm:text-lg">
            Compra, alquila o descubre proyectos inmobiliarios en un solo lugar.
          </p>
          <div className="w-full">
            <Suspense fallback={<SearchFormFallback />}>
              <SearchForm />
            </Suspense>
          </div>
        </div>
      </section>

      <CategoryShowcase />
      <ArizProjectsSection />
      <FeaturedListingsSection />
      <PublishedProjectsSection />
      <WhyChooseArizSection />
      <MapExplorerSection />
      <AccountCtaSection />
    </>
  );
}
