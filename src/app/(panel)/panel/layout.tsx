import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/features/auth";
import { can } from "@/shared/config/roles";
import { ROUTES } from "@/shared/config/routes";

/**
 * Solo valida sesion/permiso de acceso al panel. El shell visual (sidebar,
 * header, contenedor) lo pone cada layout de rol (admin/owner/client) - antes
 * este layout tambien renderizaba su propio sidebar+Container, y quedaba
 * doblemente anidado con el shell de cada rol (solo REAL_ESTATE lo evitaba
 * con un return temprano), lo que angostaba y descentraba todo el contenido.
 */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session || !can("panel:access", session.role)) {
    redirect(ROUTES.login);
  }

  return <>{children}</>;
}
