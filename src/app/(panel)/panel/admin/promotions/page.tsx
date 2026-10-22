import { Megaphone } from "lucide-react";
import { Card, CardContent } from "@/shared/ui";
import { listAdminPromotionsServer } from "@/features/promotions/api/server";
import { PromotionForm } from "@/features/promotions/components/promotion-form";
import { PromotionRowActions } from "@/features/promotions/components/promotion-row-actions";
import type { AdminPromotion } from "@/features/promotions/types";

const dateFormat = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "America/Lima",
});

function statusOf(promotion: AdminPromotion, now: number) {
  if (!promotion.isActive) return { label: "Desactivada", tone: "bg-muted/15 text-muted" };
  if (new Date(promotion.endsAt).getTime() < now) return { label: "Vencida", tone: "bg-error/10 text-error" };
  if (new Date(promotion.startsAt).getTime() > now) return { label: "Programada", tone: "bg-accent/15 text-accent" };
  return { label: "En el Home", tone: "bg-success/10 text-success" };
}

export default async function AdminPromotionsPage() {
  const promotions = await listAdminPromotionsServer();
  const now = Date.now();

  return (
    <div className="flex min-w-0 max-w-full flex-col gap-7">
      <header className="relative w-full overflow-hidden rounded-card border border-edge bg-surface p-5 text-center shadow-[var(--shadow-card)] sm:p-6">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-brand" aria-hidden="true" />
        <p className="text-sm font-black uppercase tracking-[0.22em] text-accent">Operación</p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-brand sm:text-5xl">Promociones</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-muted sm:text-base">
          Imágenes temporales que reemplazan la foto de la familia en el Home mientras estén vigentes.
        </p>
      </header>

      <PromotionForm />

      {promotions.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-60 flex-col items-center justify-center px-6 py-12 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <Megaphone className="size-7" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-black text-brand">No hay promociones</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted">
              Mientras no haya una vigente, el Home muestra la imagen de la familia.
            </p>
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {promotions.map((promotion) => {
            const status = statusOf(promotion, now);
            return (
              <Card key={promotion.id} className="flex min-w-0 flex-col overflow-hidden">
                <div className="aspect-[2/1] bg-surface-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element -- imagen externa (Cloudinary) */}
                  <img src={promotion.imageUrl} alt={promotion.title} className="size-full object-cover" />
                </div>
                <CardContent className="flex flex-1 flex-col gap-2 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="line-clamp-2 font-display text-base font-black text-brand">{promotion.title}</h2>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black ${status.tone}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-muted">
                    {dateFormat.format(new Date(promotion.startsAt))} – {dateFormat.format(new Date(promotion.endsAt))}
                  </p>
                  <div className="mt-auto">
                    <PromotionRowActions promotion={promotion} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}
