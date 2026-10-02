import { InvestmentsExperience } from "@/app/(public)/inversiones/investments-experience";
import { ROUTES } from "@/shared/config/routes";
import { buildMetadata } from "@/shared/lib/seo";

export const metadata = buildMetadata({
  title: "Inversion Ariz | Oportunidades inmobiliarias",
  description:
    "Simula tu inversion inmobiliaria, revisa oportunidades exclusivas y contacta con un asesor de ARIZ.",
  path: ROUTES.investments,
  keywords: [
    "inversion inmobiliaria",
    "Ariz Invest Club",
    "invertir en Tumbes",
    "plusvalia inmobiliaria",
    "oportunidades de inversion",
  ],
});

export default function InvestmentsPage() {
  return <InvestmentsExperience />;
}
