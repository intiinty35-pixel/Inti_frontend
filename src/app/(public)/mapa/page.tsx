import { MapExplorerSection } from "@/features/home";
import { buildMetadata } from "@/shared/lib/seo";
import { ROUTES } from "@/shared/config/routes";
import styles from "./map-page.module.css";
import { getSession } from "@/features/auth/api/server";

export const metadata = buildMetadata({
  title: "Mapa de proyectos — ARIZ",
  description: "Explora los proyectos de ARIZ, sus planos y lotes en el mapa interactivo.",
  path: ROUTES.map,
});

export default async function MapPage() {
  const session = await getSession();
  const publishHref = session?.role === "USER" ? ROUTES.panel.client.newProperty
    : session?.role === "REAL_ESTATE" ? ROUTES.panel.owner.newListing
    : session?.role === "ADMIN" ? ROUTES.panel.admin.newProperty : ROUTES.registerProfessional;
  return <div className={styles.workspace}><MapExplorerSection mapToolbarHref={publishHref} /></div>;
}
