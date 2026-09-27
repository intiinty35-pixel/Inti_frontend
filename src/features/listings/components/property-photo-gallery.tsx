import { cn } from "@/shared/lib/cn";

interface PropertyPhotoGalleryProps {
  images: string[];
  title: string;
}

const FALLBACK = "linear-gradient(135deg, #2a3b85 0%, #00124f 100%)";
const SHADE = "linear-gradient(180deg, rgb(11 20 55 / 0.06) 0%, rgb(11 20 55 / 0.18) 58%, rgb(11 20 55 / 0.72) 100%)";

function background(image?: string) {
  return [SHADE, image ? `url(${image})` : null, FALLBACK].filter(Boolean).join(", ");
}

export function PropertyPhotoGallery({ images, title }: PropertyPhotoGalleryProps) {
  const gallery = images.length > 0 ? images : [undefined];
  const cover = gallery[0];
  const thumbs = gallery.slice(0, 4);

  return (
    <section
      aria-label={`Fotos de ${title}`}
      className="relative h-[360px] overflow-hidden rounded-card border border-edge bg-brand sm:h-[520px]"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: background(cover) }}
      />

      <button
        type="button"
        className="absolute top-4 right-4 h-10 rounded-card bg-surface px-4 text-xs font-extrabold text-brand shadow-[var(--shadow-card)] transition-colors hover:bg-brand-soft"
      >
        Ver todas las fotos · {images.length}
      </button>

      <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto sm:left-5 sm:right-auto">
        {thumbs.map((image, index) => (
          <button
            key={`${image ?? "empty"}-${index}`}
            type="button"
            aria-label={`Ver foto ${index + 1}`}
            className={cn(
              "h-16 w-24 shrink-0 overflow-hidden rounded-card border bg-cover bg-center shadow-[var(--shadow-card)] sm:h-20 sm:w-28",
              index === 0 ? "border-on-brand ring-2 ring-on-brand" : "border-white/70",
            )}
            style={{ backgroundImage: background(image) }}
          >
            {index === 0 ? (
              <span className="sr-only">Foto principal</span>
            ) : null}
          </button>
        ))}
      </div>
    </section>
  );
}
