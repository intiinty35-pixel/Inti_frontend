import { HeroPromotionsCarousel } from "@/features/home/components/hero-promotions-carousel";
import type { CurrentPromotion } from "@/features/promotions/types";

/**
 * Sección exclusiva para móvil con las promociones vigentes, justo encima de
 * "¿Qué quieres hacer hoy?". En escritorio se oculta: allí las promociones ya
 * se muestran en el costado derecho del hero. Si no hay promociones vigentes
 * no se renderiza nada y el Home queda igual que siempre.
 */
export function HomePromotionsMobileSection({ promotions }: { promotions: CurrentPromotion[] }) {
  if (promotions.length === 0) return null;

  return (
    <section
      aria-label="Promociones vigentes"
      className="bg-[#f1efea] px-3 pt-[180px] pb-7 sm:px-4 sm:pt-[190px] lg:hidden"
    >
      <div className="mx-auto w-full">
        <HeroPromotionsCarousel promotions={promotions} />
      </div>
    </section>
  );
}
