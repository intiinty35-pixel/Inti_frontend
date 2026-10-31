import { HeroPromotionsCarousel } from "@/features/home/components/hero-promotions-carousel";
import type { CurrentPromotion } from "@/features/promotions/types";

export function HomePromotionsMobileSection({ promotions }: { promotions: CurrentPromotion[] }) {
  if (promotions.length === 0) return null;

  return (
    <section
      aria-label="Promociones vigentes"
      className="bg-[#f7f6f2] px-4 py-8 sm:px-6 sm:py-10 lg:hidden"
    >
      <div className="mx-auto w-full">
        <HeroPromotionsCarousel promotions={promotions} />
      </div>
    </section>
  );
}
