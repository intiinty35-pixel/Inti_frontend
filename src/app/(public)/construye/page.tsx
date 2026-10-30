import { ConstructionServices } from "@/features/services/components/construction-services";
import { InvestmentGrowthBanner } from "@/features/home";
import { buildMetadata } from "@/shared/lib/seo";
import { ROUTES } from "@/shared/config/routes";

export const metadata = buildMetadata({
  title: "INTI Proyectos construye",
  description:
    "Diseño, ingeniería, construcción, remodelación, acabados, trámites y supervisión de obras con INTI Proyectos.",
  path: ROUTES.construye,
  keywords: ["construcción de casas", "diseño y arquitectura", "remodelación", "expedientes técnicos", "Tumbes"],
});

export default function ConstruyePage() {
  return (
    <main className="bg-canvas">
      <section className="bg-brand px-4 py-20 text-center text-white sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto flex w-full max-w-[105rem] flex-col items-center">
          <h1 className="font-display text-3xl font-black uppercase tracking-tight text-accent sm:text-5xl">
            INTI PROYECTOS CONSTRUYE
          </h1>
          <p className="mt-4 max-w-3xl text-base font-bold italic text-white/90 sm:text-lg">
            «INTI PROYECTOS: Diseñamos tus ideas, construimos tus sueños y transformamos tus espacios».
          </p>
        </div>
      </section>
      <section className="mx-auto w-full max-w-[105rem] px-4 py-10 sm:px-6 lg:px-8 xl:px-10">
        <ConstructionServices />
      </section>
      <InvestmentGrowthBanner />
    </main>
  );
}
