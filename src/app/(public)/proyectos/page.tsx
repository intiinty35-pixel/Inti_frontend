import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildMetadata } from "@/shared/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Proyectos inmobiliarios, lotizacion y lotes en venta",
  description:
    "Explora proyectos inmobiliarios, proyectos de lotizacion, lotes en venta e inversiones con potencial de rentabilidad, comisiones y plusvalia.",
  path: "/proyectos",
  keywords: [
    "proyectos inmobiliarios",
    "proyectos de lotizacion",
    "lotes en venta",
    "rentabilidad inmobiliaria",
    "plusvalia inmobiliaria",
    "comisiones inmobiliarias",
  ],
});

export default function ProjectsPage() {
  redirect("/propiedades?operation=buy&type=projects");
}
