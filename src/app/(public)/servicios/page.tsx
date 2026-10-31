import { ServicesHero, ServicesSection } from "@/features/services";
import { buildMetadata } from "@/shared/lib/seo";
import { ROUTES } from "@/shared/config/routes";

export const metadata = buildMetadata({
  title: "Servicios inmobiliarios, corretaje y proyectos",
  description:
    "Servicios inmobiliarios para venta, alquiler, intermediacion, corretaje, prospeccion, gestion legal y comercializacion de proyectos inmobiliarios en Bolivia.",
  path: ROUTES.services,
  keywords: [
    "servicios inmobiliarios",
    "intermediacion inmobiliaria",
    "corretaje inmobiliario",
    "asesoria inmobiliaria",
    "comercializacion de proyectos",
    "ganar comisiones inmobiliarias",
  ],
});

export default function ServicesPage() {
  return (
    <>
      <ServicesHero />
      <ServicesSection />
    </>
  );
}
