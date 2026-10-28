import { Suspense } from "react";
import Link from "next/link";
import { SearchForm } from "@/features/search";
import {
  AccountCtaSection,
  ArizProjectsSection,
  CategoryShowcase,
  FeaturedListingsSection,
  HeroPromotions,
  HomePromotionsMobileSection,
  HomeHeroBackground,
  InvestmentEntrySection,
  InvestmentGrowthBanner,
  PublishedProjectsSection,
  TestimonialsSection,
  WelcomeModal,
  WhyChooseArizSection,
} from "@/features/home";
import { ROUTES } from "@/shared/config/routes";
import { buildMetadata } from "@/shared/lib/seo";
import { ReferralCta } from "@/features/referrals/components/referral-cta";
import { getCurrentPromotionsServer } from "@/features/promotions/api/server";

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

const HERO_OVERLAY_MOBILE =
  "linear-gradient(180deg, rgb(4 15 52 / 0.45) 0%, rgb(4 15 52 / 0.3) 50%, rgb(4 15 52 / 0.5) 100%)";

const HERO_SHELL = "mx-auto w-full max-w-[1180px]";

const HERO_TEXT = "w-full max-w-[1180px]";

function SearchFormFallback() {
  return <div className="h-[320px] w-full rounded-md bg-surface sm:h-[220px] lg:h-[118px]" />;
}

export default async function PublicHomePage() {
  const promotions = await getCurrentPromotionsServer();

  return (
    <>
      <WelcomeModal />
      <section className="relative isolate z-30 -mt-[var(--header-h)] min-h-[440px] overflow-visible pr-4 pt-[calc(var(--header-h)+2rem)] pb-[160px] pl-6 text-left text-white sm:min-h-[520px] sm:pr-6 sm:pl-7 sm:pt-[calc(var(--header-h)+4.5rem)] lg:min-h-[540px] lg:pb-32 lg:pr-6 lg:pl-8 lg:pt-[calc(var(--header-h)+6rem)] xl:pr-8 xl:pl-9">
        <HomeHeroBackground />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 lg:hidden"
          style={{ backgroundImage: HERO_OVERLAY_MOBILE }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 hidden lg:block"
          style={{ backgroundImage: HERO_OVERLAY }}
        />
        <HeroPromotions promotions={promotions} />
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-accent" />

        <div className={`${HERO_TEXT} relative z-10 flex flex-col items-start`}>
          <p className="hidden text-[10px] font-black tracking-[0.12em] text-white/90 uppercase sm:block">
            Tumbes, un gran lugar para tu historia
          </p>
          <h1 className="mt-2 max-w-2xl text-3xl leading-[1.05] font-black tracking-tight sm:text-4xl lg:text-6xl">
            Encuentra propiedades para vivir, invertir y crecer
          </h1>
          <p className="mt-2 max-w-xl text-xs font-semibold text-white/90 sm:text-sm lg:text-base">
            Compra, vende, alquila e invierte con el respaldo de una empresa solida y confiable.
          </p>
          <div className="mt-6 mb-10 flex w-full max-w-xl gap-2 sm:mb-0 sm:w-auto sm:flex-wrap sm:gap-3">
            <ReferralCta />
            <Link
              href={ROUTES.properties}
              className="inline-flex h-10 min-w-0 flex-1 items-center justify-center rounded-[6px] border border-brand bg-accent px-2 text-center text-[10px] leading-tight font-black text-brand shadow-[0_10px_26px_rgb(0_0_0_/_0.18)] transition-colors hover:bg-[#d99a00] sm:h-11 sm:flex-none sm:px-5 sm:text-sm"
            >
              Buscar propiedades
            </Link>
            <Link
              href={ROUTES.projects}
              className="inline-flex h-10 min-w-0 flex-1 items-center justify-center rounded-[6px] border border-brand bg-accent px-2 text-center text-[10px] leading-tight font-black text-brand shadow-[0_10px_26px_rgb(0_0_0_/_0.18)] transition-colors hover:bg-[#d99a00] sm:h-11 sm:flex-none sm:px-5 sm:text-sm"
            >
              Ver proyectos
            </Link>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-3 z-10 translate-y-1/2 px-4 sm:bottom-0 sm:px-6 lg:inset-x-6 lg:px-0 xl:inset-x-8">
          <div className={HERO_SHELL}>
            <Suspense fallback={<SearchFormFallback />}>
              <SearchForm />
            </Suspense>
          </div>
        </div>
      </section>

      <HomePromotionsMobileSection promotions={promotions} />
      <CategoryShowcase topSpacing={promotions.length > 0 ? "section" : "hero"} />
      <ArizProjectsSection />
      <FeaturedListingsSection />
      <PublishedProjectsSection />
      <WhyChooseArizSection />
      <InvestmentEntrySection />
      <TestimonialsSection />
      <InvestmentGrowthBanner />
      <AccountCtaSection />
    </>
  );
}
