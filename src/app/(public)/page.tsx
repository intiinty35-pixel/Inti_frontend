import { Suspense } from "react";
import { SearchForm } from "@/features/search";
import {
  AccountCtaSection,
  ArizProjectsSection,
  CategoryShowcase,
  FeaturedListingsSection,
  MapExplorerSection,
} from "@/features/home";
<<<<<<< HEAD
=======
import { cloudinaryImage } from "@/shared/lib/cloudinary";
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
import { buildMetadata } from "@/shared/lib/seo";

export const metadata = buildMetadata({
  title: "Ariz Proyectos — Casas, departamentos y terrenos en Perú",
  description:
    "Portal inmobiliario para encontrar casas, departamentos, terrenos y proyectos en Perú.",
  path: "/",
});

const HERO_BACKGROUND = [
  "linear-gradient(180deg, rgb(0 18 79 / 0.45), rgb(0 18 79 / 0.78))",
<<<<<<< HEAD
  "url(/images/hero.jpg)",
=======
  `url(${cloudinaryImage("ariz/home/hero", "f_auto,q_auto,c_fill,w_1920,h_860")})`,
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
  "linear-gradient(135deg, #1a2a6c 0%, #00124f 55%, #000a2e 100%)",
].join(", ");

function SearchFormFallback() {
  return <div className="h-[178px] w-full rounded-2xl bg-surface" />;
}

export default function PublicHomePage() {
  return (
    <>
      <section
        className="bg-cover bg-center px-4 pt-20 pb-14 text-center text-white sm:px-6"
        style={{ backgroundImage: HERO_BACKGROUND }}
      >
        <div className="mx-auto flex max-w-[942px] flex-col items-center">
          <p className="rounded-full border border-white/40 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold backdrop-blur-sm">
            Tu próximo espacio empieza aquí
          </p>
          <h1 className="mt-7 max-w-3xl text-4xl leading-[1.05] font-light tracking-tight sm:text-6xl">
            Encuentra el lugar que estás buscando
          </h1>
          <p className="mt-5 mb-14 max-w-xl text-base text-white/85 sm:text-lg">
            Compra, alquila o descubre proyectos inmobiliarios en un solo lugar.
          </p>
          <Suspense fallback={<SearchFormFallback />}>
            <SearchForm />
          </Suspense>
        </div>
      </section>

      <CategoryShowcase />
      <ArizProjectsSection />
      <FeaturedListingsSection />
      <MapExplorerSection />
      <AccountCtaSection />
    </>
  );
}
