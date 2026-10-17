"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Video, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";

function getEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    const segments = url.pathname.split("/").filter(Boolean);
    let videoId: string | undefined;

    if (hostname === "youtu.be") {
      videoId = segments[0];
    } else if (["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(hostname)) {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v") ?? undefined;
      } else if (["embed", "shorts", "live"].includes(segments[0] ?? "")) {
        videoId = segments[1];
      }
    }

    if (videoId && /^[\w-]{11}$/.test(videoId)) {
      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
    }
  } catch {
    // Conserva la URL original para otros proveedores de recorridos virtuales.
  }

  return value;
}

export function ProjectTourVideo({
  projectName,
  url,
  className,
}: {
  projectName: string;
  url: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const embedUrl = getEmbedUrl(url);
  const portalTarget = typeof document === "undefined" ? null : document.body;

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={`Ver recorrido virtual de ${projectName}`}
        title="Ver recorrido virtual"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/70 bg-brand/90 text-white shadow-[var(--shadow-card)] backdrop-blur transition-colors hover:bg-brand",
          className,
        )}
      >
        <Video className="size-5" aria-hidden="true" />
      </button>

      {open && portalTarget
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Recorrido virtual de ${projectName}`}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-brand/70 p-4 backdrop-blur-sm"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setOpen(false);
              }}
            >
              <section className="w-full max-w-5xl overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-pop)]">
                <header className="flex items-center gap-4 border-b border-edge px-4 py-3 sm:px-6">
                  <h2 className="min-w-0 flex-1 truncate text-sm font-bold text-brand sm:text-base">
                    Recorrido virtual · {projectName}
                  </h2>
                  <button
                    type="button"
                    aria-label="Cerrar recorrido virtual"
                    onClick={() => setOpen(false)}
                    className="flex size-9 shrink-0 items-center justify-center rounded-full border border-edge text-muted transition-colors hover:border-brand hover:text-brand"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </header>
                <div className="aspect-video bg-black">
                  {/\.(mp4|webm|mov|m4v|ogv)(?:$|[?#])/i.test(url) || url.includes("/video/upload/") ? (
                    <video src={url} controls autoPlay playsInline className="size-full" />
                  ) : (
                  <iframe
                    src={embedUrl}
                    title={`Recorrido virtual de ${projectName}`}
                    className="size-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                  )}
                </div>
              </section>
            </div>,
            portalTarget,
          )
        : null}
    </>
  );
}
