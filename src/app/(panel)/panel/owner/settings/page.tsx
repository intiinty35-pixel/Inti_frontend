import { getMyNotificationSettings } from "@/features/owner/api/server";
import { DashboardPanel, PageBanner } from "@/features/owner/components/dashboard-ui";
import { OwnerSettingsForm } from "@/features/owner/components/owner-settings-form";

export default async function OwnerSettingsPage() {
  const settings = await getMyNotificationSettings();

  return (
    <div className="flex flex-col gap-6">
      <PageBanner
        eyebrow="Preferencias"
        title="Configuracion"
        description="Controla las notificaciones y avisos de tu cuenta profesional."
      />

      <DashboardPanel title="Notificaciones">
        <OwnerSettingsForm initialSettings={settings} />
      </DashboardPanel>
    </div>
  );
}
