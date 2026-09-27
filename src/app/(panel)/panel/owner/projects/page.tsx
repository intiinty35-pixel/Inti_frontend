import { Card, CardContent } from "@/shared/ui";
import { OwnerPageHeader } from "@/app/(panel)/panel/owner/owner-shell";

export default function OwnerProjectsPage() {
  return (
    <div className="flex flex-col gap-6">
      <OwnerPageHeader eyebrow="Portafolio" title="Mis proyectos" />
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-sm font-semibold text-ink">Disponible próximamente</p>
          <p className="max-w-sm text-xs text-muted">
            La gestión de proyectos inmobiliarios (etapas, unidades y disponibilidad) todavía no
            está conectada al backend.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
