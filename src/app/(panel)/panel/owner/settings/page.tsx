import { BellIcon, CalendarIcon, ChartIcon, Checkbox, WhatsappIcon } from "@/shared/ui";
import { OwnerPageHeader } from "@/app/(panel)/panel/owner/owner-shell";
import { DashboardPanel } from "@/features/owner/components/dashboard-ui";

const SETTINGS = [
  {
    icon: BellIcon,
    title: "Notificarme por correo cuando reciba un lead",
    defaultChecked: true,
  },
  {
    icon: WhatsappIcon,
    title: "Notificarme por WhatsApp",
    defaultChecked: false,
  },
  {
    icon: CalendarIcon,
    title: "Recibir recordatorios de vencimiento",
    defaultChecked: true,
  },
  {
    icon: ChartIcon,
    title: "Enviar resumen semanal de estadísticas",
    defaultChecked: true,
  },
] as const;

export default function OwnerSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <OwnerPageHeader eyebrow="Preferencias" title="Configuración" />
      <p className="-mt-4 text-sm text-muted">Controla las notificaciones de tu cuenta.</p>

      <DashboardPanel title="Notificaciones">
        <div className="mt-4 flex w-full flex-col gap-3 text-left">
          {SETTINGS.map((setting) => {
            const Icon = setting.icon;
            return (
              <div
                key={setting.title}
                className="flex items-center gap-4 rounded-card border border-edge bg-surface px-4 py-3.5"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <Checkbox
                    defaultChecked={setting.defaultChecked}
                    disabled
                    label={
                      <span>
                        <span className="font-medium text-ink">{setting.title}</span>
                        <span className="block text-xs text-muted">Disponible próximamente.</span>
                      </span>
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      </DashboardPanel>
    </div>
  );
}
