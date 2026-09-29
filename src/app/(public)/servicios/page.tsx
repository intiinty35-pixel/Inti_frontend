import { ServicesHero, ServicesSection } from "@/features/services";
import { buildMetadata } from "@/shared/lib/seo";
import { ROUTES } from "@/shared/config/routes";

export const metadata = buildMetadata({
  title: "Servicios — Ariz Proyectos",
  description:
    "Corretaje inmobiliario y servicios de prospección, legal y contable para proyectos inmobiliarios en Perú. Te acompañamos desde la idea hasta la venta.",
  path: ROUTES.services,
});

export default function ServicesPage() {
  return (
    <>
      <ServicesHero />
      <ServicesSection />
    </>
  );
}
