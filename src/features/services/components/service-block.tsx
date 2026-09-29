import { CheckIcon, WhatsappIcon } from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import { cloudinaryImage } from "@/shared/lib/cloudinary";
import {
  buildServiceWhatsappUrl,
  SERVICES_CONTACT_HREF,
  type ServiceItem,
} from "@/features/services/config";

export interface ServiceBlockProps {
  service: ServiceItem;
  /** En escritorio invierte el orden: la foto pasa a la derecha. */
  reversed?: boolean;
}

/**
 * Overlay azul marino sobre la foto: asegura contraste con la etiqueta flotante
 * y mantiene el tono de marca sin oscurecer de mas la imagen.
 */
const PHOTO_OVERLAY = "linear-gradient(180deg, rgb(0 18 79 / 0.10) 0%, rgb(0 18 79 / 0.55) 100%)";

const PHOTO = "h-72 w-full rounded-2xl object-cover sm:h-80 lg:h-[420px]";

export function ServiceBlock({ service, reversed = false }: ServiceBlockProps) {
  const Icon = service.icon;
  const whatsappUrl = buildServiceWhatsappUrl(service.name);

  return (
    <div
      className={cn(
        "grid items-center gap-8 lg:grid-cols-2 lg:gap-14",
        reversed && "lg:[&>*:first-child]:order-2",
      )}
    >
      {/* ---- Foto con overlay azul y etiqueta flotante del icono ---- */}
      <div className="relative">
        <img
          src={cloudinaryImage(service.image, "f_auto,q_auto,c_fill,w_1200,h_860")}
          alt={service.imageAlt}
          loading="lazy"
          decoding="async"
          className={PHOTO}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{ backgroundImage: PHOTO_OVERLAY }}
        />

        <span className="absolute bottom-4 left-4 flex size-12 items-center justify-center rounded-2xl bg-accent text-on-accent shadow-[var(--shadow-card)]">
          <Icon className="size-6" />
        </span>

        <span className="absolute bottom-4 right-4 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-black tracking-[0.14em] text-white uppercase backdrop-blur-sm">
          {service.name}
        </span>
      </div>

      {/* ---- Texto: titulo, descripcion, viñetas y botones ---- */}
      <div>
        <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
          <Icon className="size-4" />
          {service.name}
        </span>

        <h3 className="mt-3 text-2xl font-bold tracking-tight text-brand sm:text-3xl">
          {service.title}
        </h3>

        <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
          {service.description}
        </p>

        <ul className="mt-6 grid gap-3">
          {service.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                <CheckIcon className="size-3.5" strokeWidth={2.6} />
              </span>
              <span className="text-sm text-ink">{bullet}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={SERVICES_CONTACT_HREF}
            className="flex h-11 items-center justify-center rounded-card bg-brand px-6 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
          >
            Cotiza
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 items-center justify-center gap-2 rounded-card bg-[#25d366] px-6 text-sm font-bold text-white transition-colors hover:bg-[#1fb857]"
          >
            <WhatsappIcon className="size-4.5" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
