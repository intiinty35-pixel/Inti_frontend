"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-md bg-brand-soft px-2.5 py-1.5 text-xs font-bold text-brand transition-colors hover:bg-brand-soft/80"
      title="Copiar código"
    >
      {copied ? (
        <>
          <Check className="size-3.5" />
          Copiado
        </>
      ) : (
        <>
          <Copy className="size-3.5" />
          {code}
        </>
      )}
    </button>
  );
}
