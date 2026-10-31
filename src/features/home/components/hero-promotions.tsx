import Image from "next/image";
import { HeroPromotionsCarousel } from "@/features/home/components/hero-promotions-carousel";
import type { CurrentPromotion } from "@/features/promotions/types";

const HERO_SLOT =
  "pointer-events-none absolute right-0 bottom-6 z-5 hidden w-[42vw] max-w-[620px] min-w-[400px] lg:block xl:right-8";

/**
 * Espacio derecho del hero. Si hay promociones vigentes las muestra en carrusel;
 * si no, deja la imagen de la familia de siempre.
 */
export function HeroPromotions({ promotions }: { promotions: CurrentPromotion[] }) {
  if (promotions.length === 0) {
    return (
      <div aria-hidden className={HERO_SLOT}>
        <Image
          src="/logo/image.png"
          alt=""
          width={1536}
          height={1024}
          priority
          className="h-auto w-full object-contain drop-shadow-[0_28px_55px_rgb(0_0_0_/_0.28)]"
        />
      </div>
    );
  }

  return (
    <div className="absolute right-0 bottom-28 z-5 hidden w-[38vw] max-w-[560px] min-w-[360px] lg:block xl:right-8">
      <HeroPromotionsCarousel promotions={promotions} />
    </div>
  );
}
