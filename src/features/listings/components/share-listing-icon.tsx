"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

interface ShareListingIconProps {
  title: string;
  href: string;
  className?: string;
}

export function ShareListingIcon({ title, href, className = "" }: ShareListingIconProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const url = `${window.location.origin}${href}`;
    const shareText = `Mira esta propiedad: ${title}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url,
        });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("No se pudo copiar el enlace:", error);
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={`Compartir ${title}`}
      title={copied ? "¡Copiado!" : "Compartir"}
      className={`inline-flex size-8 items-center justify-center rounded-full border border-white/70 bg-brand/90 text-white shadow-[var(--shadow-card)] backdrop-blur transition-colors hover:bg-brand ${className}`}
    >
      {copied ? <Check className="size-4" aria-hidden="true" /> : <Share2 className="size-4" aria-hidden="true" />}
    </button>
  );
}
