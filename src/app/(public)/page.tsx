import {
  AccountCtaSection,
  ArizProjectsSection,
  CategoryShowcase,
  FeaturedListingsSection,
  HeroSearchSection,
  HomePromotionsMobileSection,
  WelcomeModal,
  WhyChooseArizSection,
} from "@/features/home";
import { buildMetadata } from "@/shared/lib/seo";
import { getCurrentPromotionsServer } from "@/features/promotions/api/server";

export const metadata = buildMetadata({
  title: "Inmobiliaria en Santa Cruz de la Sierra: venta, alquiler y proyectos",
  description:
    "Encuentra casas, departamentos, terrenos y proyectos inmobiliarios en Santa Cruz de la Sierra, Bolivia. Compra, alquila o invierte con el acompañamiento de Inti Proyectos.",
  path: "/",
  keywords: [
    "inmobiliaria inti",
    "buscar propiedades en Bolivia",
    "comprar propiedades",
    "alquilar propiedades",
    "proyectos de lotes",
    "proyectos con plusvalia",
  ],
});

export default async function PublicHomePage() {
  const promotions = await getCurrentPromotionsServer();

  return (
    <>
      <WelcomeModal />
      <section className="relative isolate z-30 -mt-[var(--header-h)] flex min-h-[640px] items-center overflow-visible px-5 pt-[calc(var(--header-h)+5rem)] pb-24 text-white sm:min-h-[690px] sm:px-8 sm:pt-[calc(var(--header-h)+4rem)] lg:min-h-[760px] lg:px-10 lg:pt-[calc(var(--header-h)+3rem)]">
        <HeroSearchSection promotions={promotions} />
      </section>

      <HomePromotionsMobileSection promotions={promotions} />
      <CategoryShowcase />
      <ArizProjectsSection />
      <FeaturedListingsSection />
      <AccountCtaSection />
      <WhyChooseArizSection />
    </>
  );
}
