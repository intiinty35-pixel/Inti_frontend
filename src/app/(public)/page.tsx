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
} from "@/features/home";
import { buildMetadata } from "@/shared/lib/seo";

export const metadata = buildMetadata({
  title: "Inmobiliaria en Peru: venta, alquiler y proyectos",
  description:
    "Busca casas, departamentos, terrenos, lotes y proyectos inmobiliarios en Peru. Compra, alquila, vende y descubre oportunidades con rentabilidad, plusvalia y comisiones.",
  path: "/",
  keywords: [
    "inmobiliaria ariz",
    "buscar propiedades en Peru",
    "comprar propiedades",
    "alquilar propiedades",
    "proyectos de lotes",
    "proyectos con plusvalia",
  ],
});

const HERO_OVERLAY =
  "linear-gradient(180deg, rgb(0 0 0 / 0.22) 0%, rgb(0 0 0 / 0.08) 48%, rgb(0 0 0 / 0.20) 100%)";

const HERO_SHELL = "mx-auto w-full max-w-[942px]";

function SearchFormFallback() {
  return <div className="h-[178px] w-full rounded-2xl bg-surface" />;
}

export default function PublicHomePage() {
  return (
    <>
      <section className="relative isolate overflow-visible px-4 pt-[4.5rem] pb-10 text-center text-white sm:px-6 sm:pt-[5.5rem] sm:pb-12 lg:px-6 lg:pt-24 xl:px-8">
        <HomeHeroBackground />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ backgroundImage: HERO_OVERLAY }}
        />
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-accent" />

        <div className={`${HERO_SHELL} flex flex-col items-center`}>
          <p className="rounded-full border border-white/40 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold backdrop-blur-sm">
            Tu proximo espacio empieza aqui
          </p>
          <h1 className="mt-7 max-w-5xl text-4xl leading-[1.05] font-light tracking-tight sm:text-6xl lg:text-7xl">
            Encuentra propiedades, alquileres y proyectos inmobiliarios
          </h1>
          <p className="mt-5 mb-8 max-w-2xl text-base text-white/90 sm:text-lg">
            Compra, alquila, vende o invierte en propiedades, lotes y proyectos con potencial de rentabilidad y plusvalia.
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
      <MapExplorerSection />
      <AccountCtaSection />
    </>
  );
}
