import { Card, CardContent } from "@/shared/ui";
import { OwnerPageHeader } from "@/app/(panel)/panel/owner/owner-shell";

export default function NewProjectPage() {
  return (
    <div className="flex flex-col gap-6">
      <OwnerPageHeader eyebrow="Publicación" title="Publicar proyecto" />
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-sm font-semibold text-ink">Disponible próximamente</p>
          <p className="max-w-sm text-xs text-muted">
            Publicar proyectos inmobiliarios completos todavía no está conectado al backend.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
