/** ARIZ support number in wa.me international format. */
export const ARIZ_WHATSAPP_DIGITS = "51956678664";

/** Gerencia ARIZ WhatsApp number in wa.me international format. */
export const ARIZ_MANAGER_WHATSAPP_DIGITS = "51956678664";

export function buildArizWhatsappUrl(message: string): string {
  return `https://wa.me/${ARIZ_WHATSAPP_DIGITS}?text=${encodeURIComponent(message)}`;
}

export function buildArizManagerWhatsappUrl(message: string): string {
  return `https://wa.me/${ARIZ_MANAGER_WHATSAPP_DIGITS}?text=${encodeURIComponent(message)}`;
}
