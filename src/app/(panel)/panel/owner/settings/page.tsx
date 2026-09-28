import { Card, CardContent, Checkbox } from "@/shared/ui";
import { OwnerPageHeader } from "@/app/(panel)/panel/owner/owner-shell";

export default function OwnerSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <OwnerPageHeader eyebrow="Preferencias" title="Configuración" />
      <p className="-mt-4 text-sm text-muted">Controla las notificaciones de tu cuenta.</p>

      <Card>
        <CardContent className="flex flex-col gap-5 pt-6">
          <Checkbox
            defaultChecked
            disabled
            label={
              <span>
                <span className="font-medium text-ink">Notificarme por correo cuando reciba un lead</span>
                <span className="block text-muted">Disponible próximamente.</span>
              </span>
            }
          />
          <Checkbox
            disabled
            label={
              <span>
                <span className="font-medium text-ink">Notificarme por WhatsApp</span>
                <span className="block text-muted">Disponible próximamente.</span>
              </span>
            }
          />
          <Checkbox
            defaultChecked
            disabled
            label={
              <span>
                <span className="font-medium text-ink">Recibir recordatorios de vencimiento</span>
                <span className="block text-muted">Disponible próximamente.</span>
              </span>
            }
          />
          <Checkbox
            defaultChecked
            disabled
            label={
              <span>
                <span className="font-medium text-ink">Enviar resumen semanal de estadísticas</span>
                <span className="block text-muted">Disponible próximamente.</span>
              </span>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
