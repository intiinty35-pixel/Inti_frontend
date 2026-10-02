import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { SearchForm } from "@/features/search";
import {
  AccountCtaSection,
  ArizProjectsSection,
  CategoryShowcase,
  FeaturedListingsSection,
  HomeHeroBackground,
  InvestmentEntrySection,
  InvestmentGrowthBanner,
  PublishedProjectsSection,
  TestimonialsSection,
  WhyChooseArizSection,
} from "@/features/home";
import { ROUTES } from "@/shared/config/routes";
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
  "linear-gradient(90deg, rgb(4 15 52 / 0.86) 0%, rgb(4 15 52 / 0.66) 32%, rgb(4 15 52 / 0.22) 52%, rgb(4 15 52 / 0.04) 68%, rgb(4 15 52 / 0) 82%), linear-gradient(180deg, rgb(0 0 0 / 0.12) 0%, rgb(0 0 0 / 0.01) 54%, rgb(0 0 0 / 0.14) 100%)";

const HERO_SHELL = "mx-auto w-full max-w-[1180px]";

// El texto del hero arranca pegado al borde izquierdo (sin mx-auto) para que no
// quede centrado en pantallas anchas; mantiene el max-w para no perder legibilidad.
const HERO_TEXT = "w-full max-w-[1180px]";

function SearchFormFallback() {
  return <div className="h-[118px] w-full rounded-md bg-surface" />;
}

export default function PublicHomePage() {
  return (
    <>
      <section className="relative isolate -mt-[var(--header-h)] min-h-[540px] overflow-visible pr-4 pt-[calc(var(--header-h)+5rem)] pb-32 pl-6 text-left text-white sm:pr-6 sm:pl-7 sm:pt-[calc(var(--header-h)+6rem)] lg:pr-6 lg:pl-8 lg:pt-[calc(var(--header-h)+6rem)] xl:pr-8 xl:pl-9">
        <HomeHeroBackground />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ backgroundImage: HERO_OVERLAY }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 bottom-6 z-0 hidden w-[48vw] max-w-[760px] min-w-[520px] lg:block xl:right-8"
        >
          <Image
            src="/logo/image.png"
            alt=""
            width={1536}
            height={1024}
            priority
            className="h-auto w-full object-contain drop-shadow-[0_28px_55px_rgb(0_0_0_/_0.28)]"
          />
        </div>
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-accent" />

        <div className={`${HERO_TEXT} relative z-10 flex flex-col items-start`}>
          <p className="text-[11px] font-black tracking-[0.12em] text-white/90 uppercase">
            Tumbes, un gran lugar para tu historia
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl leading-[1.02] font-black tracking-tight sm:text-5xl lg:text-6xl">
            Encuentra propiedades para vivir, invertir y crecer
          </h1>
          <p className="mt-3 max-w-xl text-sm font-semibold text-white/90 sm:text-base">
            Compra, vende, alquila e invierte con el respaldo de una empresa solida y confiable.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={ROUTES.projects}
              className="inline-flex h-11 items-center justify-center rounded-[6px] bg-accent px-5 text-sm font-black text-on-accent shadow-[0_10px_26px_rgb(0_0_0_/_0.18)] transition-colors hover:bg-accent-hover"
            >
              Ver proyectos
            </Link>
            <Link
              href={ROUTES.properties}
              className="inline-flex h-11 items-center justify-center rounded-[6px] border border-white/45 bg-white/12 px-5 text-sm font-black text-white backdrop-blur-sm transition-colors hover:border-white/75 hover:bg-white/18"
            >
              Buscar propiedades
            </Link>
            <Link
              href={ROUTES.investments}
              className="inline-flex h-11 items-center justify-center rounded-[6px] border border-white/45 bg-white/12 px-5 text-sm font-black text-white backdrop-blur-sm transition-colors hover:border-white/75 hover:bg-white/18"
            >
              Invertir con Ariz
            </Link>
          </div>
        </div>

        <div className="absolute inset-x-4 bottom-0 z-10 translate-y-1/2 sm:inset-x-6 lg:inset-x-6 xl:inset-x-8">
          <div className={HERO_SHELL}>
            <Suspense fallback={<SearchFormFallback />}>
              <SearchForm />
            </Suspense>
          </div>
        </div>
      </section>

      <CategoryShowcase />
      <PublishedProjectsSection />
      <FeaturedListingsSection />
      <ArizProjectsSection />
      <WhyChooseArizSection />
      <InvestmentEntrySection />
      <TestimonialsSection />
      <InvestmentGrowthBanner />
      <AccountCtaSection />
    </>
  );
}
