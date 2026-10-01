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

const HERO_OVERLAY = [
  "linear-gradient(180deg, rgb(0 0 0 / 0.18) 0%, rgb(0 0 0 / 0.02) 45%, rgb(0 0 0 / 0.14) 100%)",
  "linear-gradient(90deg, rgb(0 18 79 / 0.72) 0%, rgb(0 18 79 / 0.44) 46%, rgb(0 18 79 / 0.16) 100%)",
].join(", ");

const HERO_SHELL = "mx-auto w-full max-w-[942px]";

function SearchFormFallback() {
  return <div className="h-[178px] w-full rounded-2xl bg-surface" />;
}

export default function PublicHomePage() {
  return (
    <>
      <section className="relative isolate overflow-visible -mt-[var(--header-h)] px-4 pt-[calc(var(--header-h)+7rem)] pb-20 text-center text-white sm:px-6 sm:pt-[calc(var(--header-h)+8.5rem)] sm:pb-24 lg:px-6 lg:pt-[calc(var(--header-h)+6rem)] xl:px-8">
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