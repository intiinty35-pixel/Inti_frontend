"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button, type ButtonProps } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";

interface ReferralShareButtonProps {
  /** Codigo del referente ya validado (ej. APCOD-80CF0F2B). */
  code: string;
  /** Nombre del referente para personalizar el mensaje compartido. */
  referrerName?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}

/** Construye el enlace publico de referido con el codigo embebido. */
function buildReferralUrl(code: string): string {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}${ROUTES.rewards}?code=${encodeURIComponent(code)}`;
}

/**
 * Boton "Referir" para el area de recompensas. Permite al referente seguir
 * compartiendo su MISMO codigo (web share con fallback a copiar enlace) para
 * sumar referidos y acercarse a su proxima recompensa.
 */
export function ReferralShareButton({
  code,
  referrerName,
  variant = "primary",
  size = "md",
  className,
}: ReferralShareButtonProps) {
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = buildReferralUrl(code);
    const text = referrerName
      ? `Hola, ${referrerName} te invita a descubrir nuevas oportunidades inmobiliarias con Ariz.`
      : "Descubre nuevas oportunidades inmobiliarias con Ariz.";
    const shareMessage = `Únete con mi código ${code} en Ariz. ${url}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Ariz Club", text, url });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        // Si falla el share nativo, caemos al copiado por portapapeles.
      }
    }

    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setMessage("No se pudo compartir. Copia tu código manualmente.");
      return;
    }

    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      setMessage("Enlace copiado. ¡Compártelo y suma puntos!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setMessage("No se pudo copiar el enlace.");
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={share}
        className={className}
      >
        <Share2 className="size-4 shrink-0" aria-hidden="true" />
        {copied ? "¡Copiado!" : "Referir"}
      </Button>
      <span aria-live="polite" className="text-xs text-muted">
        {message}
      </span>
    </div>
  );
}
