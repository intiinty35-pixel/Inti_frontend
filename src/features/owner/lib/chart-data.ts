import type { Lead } from "@/features/owner/types/property";
import { CATEGORICAL } from "@/shared/ui";

const DAY_LABEL = new Intl.DateTimeFormat("es-BO", { day: "2-digit", month: "2-digit" });

export function leadsPerDay(leads: Lead[], days: number, now: number): { label: string; value: number }[] {
  const buckets = new Map<string, number>();
  const points: { key: string; label: string }[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(now - i * 86_400_000);
    const key = date.toISOString().slice(0, 10);
    buckets.set(key, 0);
    points.push({ key, label: DAY_LABEL.format(date) });
  }

  for (const lead of leads) {
    const key = new Date(lead.createdAt).toISOString().slice(0, 10);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }

  return points.map((point) => ({ label: point.label, value: buckets.get(point.key) ?? 0 }));
}

const SOURCE_LABELS: Record<Lead["source"], string> = {
  PROPERTY_FORM: "Formulario",
  PROJECT_FORM: "Formulario de proyecto",
  WHATSAPP: "WhatsApp",
  QUICK_QUESTION: "Pregunta rápida",
  PHONE: "Teléfono",
};

export function leadsBySource(leads: Lead[]) {
  const order: Lead["source"][] = [
    "PROPERTY_FORM",
    "PROJECT_FORM",
    "WHATSAPP",
    "QUICK_QUESTION",
    "PHONE",
  ];
  const counts = new Map<Lead["source"], number>();
  for (const lead of leads) {
    counts.set(lead.source, (counts.get(lead.source) ?? 0) + 1);
  }

  return order
    .map((source, index) => ({
      label: SOURCE_LABELS[source],
      value: counts.get(source) ?? 0,
      color: CATEGORICAL[index],
    }))
    .filter((item) => item.value > 0);
}
