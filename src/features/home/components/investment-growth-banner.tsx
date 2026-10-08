import Link from "next/link";
import { BuildingIcon, ChartIcon, HomeIcon, SparkleIcon, WhatsappIcon } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { buildServiceWhatsappUrl } from "@/features/services/config";

const BANNER_IMAGE = "/inversiones/tumbes-coast-banner.png";

const pillars = [
  { label: "Vive", Icon: HomeIcon },
  { label: "Invierte", Icon: ChartIcon },
  { label: "Construye", Icon: BuildingIcon },
  { label: "Crece", Icon: SparkleIcon },
];

export function InvestmentGrowthBanner() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#071A5A_0%,#273E84_58%,var(--brand-soft)_100%)]">
      <div className="relative min-h-[250px] w-full overflow-hidden bg-[#071A5A] sm:min-h-[230px] lg:min-h-[210px]">
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${BANNER_IMAGE})` }}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(90deg,rgb(7_26_90_/_0.96)_0%,rgb(7_26_90_/_0.82)_34%,rgb(7_26_90_/_0.48)_68%,rgb(7_26_90_/_0.18)_100%)]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgb(7_26_90_/_0)_0%,#273E84_58%,var(--brand-soft)_100%)]"
        />

        <div className="relative z-10 mx-auto grid min-h-[250px] w-full max-w-[105rem] gap-6 px-4 py-7 text-white sm:min-h-[230px] sm:px-6 lg:min-h-[210px] lg:grid-cols-[1fr_auto] lg:items-center lg:px-8 xl:px-10">
          <div>
            <p className="text-[11px] font-black tracking-[0.16em] text-accent uppercase">Invierte con Ariz</p>
            <h2 className="mt-2 max-w-xl text-2xl leading-tight font-black tracking-tight sm:text-3xl">
              Haz crecer tu inversion con <span className="text-accent">Ariz Proyectos</span>
            </h2>
            <p className="mt-2 max-w-xl text-sm font-semibold text-white/86">
              Terrenos, casas y departamentos en las mejores zonas del Perú y Tumbes.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={buildServiceWhatsappUrl("inversion con Ariz Proyectos")}
                target="_blank"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[6px] bg-[#25D366] px-4 text-sm font-black text-white transition hover:bg-[#1fb85a]"
              >
                <WhatsappIcon className="size-5" />
                Hablar por WhatsApp
              </Link>
              <Link
                href={ROUTES.investments}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[6px] bg-accent px-4 text-sm font-black text-on-accent transition hover:bg-accent-hover"
              >
                Solicitar asesoria
                <ChartIcon className="size-4" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-5 lg:min-w-[460px] lg:items-end">
            <div className="flex w-full flex-wrap items-center gap-x-6 gap-y-4 lg:justify-start">
              {pillars.map(({ label, Icon }) => (
                <Link
                  key={label}
                  href={ROUTES.investments}
                  className="group flex flex-col items-center gap-2 text-center transition hover:-translate-y-0.5"
                >
                  <span className="inline-flex size-12 items-center justify-center rounded-full border border-accent/80 bg-[#071A5A]/55 text-accent shadow-[0_10px_26px_rgb(0_0_0_/_0.18)] backdrop-blur-sm transition group-hover:bg-accent group-hover:text-on-accent">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-[11px] font-black text-white group-hover:text-accent sm:text-xs">
                    {label}
                  </span>
                </Link>
              ))}
            </div>

            <p className="max-w-[220px] text-right text-2xl leading-none font-black tracking-tight text-white sm:text-3xl">
              Tumbes,
              <span className="block text-accent">gran futuro</span>
            </p>
          </div>
        </div>
      </div>
      <div aria-hidden className="h-12 bg-[linear-gradient(180deg,var(--brand-soft)_0%,var(--brand-soft)_100%)]" />
    </section>
  );
}
