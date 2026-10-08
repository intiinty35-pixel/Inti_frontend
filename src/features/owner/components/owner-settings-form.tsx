"use client";

import type { ComponentType, SVGProps } from "react";
import { useState } from "react";
import { BellIcon, CalendarIcon, ChartIcon, Checkbox, WhatsappIcon } from "@/shared/ui";
import { OwnerRequestError, updateOwnerNotificationSettings } from "@/features/owner/api/client";
import type { OwnerNotificationSettings } from "@/features/owner/types/settings";

type SettingKey = "emailLeads" | "whatsappLeads" | "membershipReminders" | "weeklyStats";

const SETTINGS: Array<{
  key: SettingKey;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}> = [
  {
    key: "emailLeads",
    icon: BellIcon,
    title: "Notificarme por correo cuando reciba un lead",
    description: "Activa o pausa los correos que llegan cuando una propiedad o proyecto recibe una consulta.",
  },
  {
    key: "whatsappLeads",
    icon: WhatsappIcon,
    title: "Notificarme por WhatsApp",
    description: "Guarda tu preferencia para avisos por WhatsApp cuando el canal este conectado.",
  },
  {
    key: "membershipReminders",
    icon: CalendarIcon,
    title: "Recibir recordatorios de vencimiento",
    description: "Permite avisos relacionados con renovacion y vencimiento de tu membresia.",
  },
  {
    key: "weeklyStats",
    icon: ChartIcon,
    title: "Enviar resumen semanal de estadisticas",
    description: "Permite recibir un resumen periodico del rendimiento de tus publicaciones.",
  },
];

export function OwnerSettingsForm({ initialSettings }: { initialSettings: OwnerNotificationSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [savingKey, setSavingKey] = useState<SettingKey | null>(null);
  const [error, setError] = useState("");
  const [savedKey, setSavedKey] = useState<SettingKey | null>(null);

  async function toggleSetting(key: SettingKey) {
    const nextValue = !settings[key];
    const previous = settings;
    setSettings((current) => ({ ...current, [key]: nextValue }));
    setSavingKey(key);
    setSavedKey(null);
    setError("");

    try {
      const updated = await updateOwnerNotificationSettings({ [key]: nextValue });
      setSettings(updated);
      setSavedKey(key);
    } catch (settingError) {
      setSettings(previous);
      setError(
        settingError instanceof OwnerRequestError
          ? settingError.messages[0]
          : "No se pudo guardar la configuracion.",
      );
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="mt-4 flex w-full flex-col gap-3 text-left">
      {SETTINGS.map((setting) => {
        const Icon = setting.icon;
        const saving = savingKey === setting.key;
        const saved = savedKey === setting.key;

        return (
          <div
            key={setting.key}
            className="flex items-start gap-4 rounded-card border border-edge bg-surface px-4 py-3.5"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <Icon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <Checkbox
                checked={settings[setting.key]}
                disabled={saving}
                onChange={() => void toggleSetting(setting.key)}
                label={
                  <span>
                    <span className="font-medium text-ink">{setting.title}</span>
                    <span className="block text-xs leading-5 text-muted">{setting.description}</span>
                    {saving ? <span className="block text-xs font-semibold text-brand">Guardando...</span> : null}
                    {saved ? <span className="block text-xs font-semibold text-success">Guardado.</span> : null}
                  </span>
                }
              />
            </div>
          </div>
        );
      })}

      {error ? <p role="alert" className="rounded-card bg-error/10 px-3 py-2 text-sm font-semibold text-error">{error}</p> : null}
    </div>
  );
}
