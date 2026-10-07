import {
  Banknote,
  CalendarDays,
  FileCheck2,
  Mail,
  ReceiptText,
  UserRound,
} from "lucide-react";
import { Card, CardContent, Pagination } from "@/shared/ui";
import { formatPrice } from "@/shared/lib/format";
import { ROUTES } from "@/shared/config/routes";
import { listPendingSubscriptions } from "@/features/admin/api/server";
import { SubscriptionReviewActions } from "@/features/admin/components/subscription-review-actions";

interface AdminSubscriptionsPageProps {
  searchParams: Promise<{ page?: string }>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function AdminSubscriptionsPage({ searchParams }: AdminSubscriptionsPageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { items: subscriptions, total, pageSize } = await listPendingSubscriptions(page, 12);
  const totalAmount = subscriptions.reduce(
    (sum, subscription) => sum + Number(subscription.plan.price),
    0,
  );

  return (
    <div className="flex min-w-0 max-w-full flex-col gap-7 overflow-x-hidden">
      <section className="relative overflow-hidden rounded-card border border-edge bg-surface p-5 text-center shadow-[var(--shadow-card)] sm:p-6">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-brand" aria-hidden="true" />
        <p className="text-sm font-black uppercase tracking-[0.22em] text-accent">
          Pagos
        </p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-brand sm:text-5xl">
          Solicitudes de pago
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-muted sm:text-base">
          Revisa comprobantes y activa planes después de validar el pago.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Pendientes"
          value={total}
          hint="Solicitudes esperando revisión."
          tone="bg-brand-soft text-brand"
          Icon={ReceiptText}
        />
        <MetricCard
          label="Monto visible"
          value={formatPrice(totalAmount, "PEN")}
          hint="Suma de solicitudes en esta página."
          tone="bg-success/10 text-success"
          Icon={Banknote}
        />
        <MetricCard
          label="Página"
          value={page}
          hint={`${subscriptions.length} solicitudes visibles.`}
          tone="bg-accent/15 text-accent"
          Icon={FileCheck2}
        />
      </section>

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <ReceiptText className="size-7" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-black text-brand">
              No hay solicitudes pendientes
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted">
              Cuando un profesional envíe un comprobante de pago, aparecerá aquí.
            </p>
          </CardContent>
        </Card>
      ) : (
        <section className="grid min-w-0 max-w-full gap-4 overflow-x-hidden md:grid-cols-2 xl:grid-cols-4">
          {subscriptions.map((subscription) => {
            const name =
              subscription.agentProfile.businessName ??
              `${subscription.agentProfile.user.firstName} ${subscription.agentProfile.user.lastName ?? ""}`.trim();

            return (
              <Card
                key={subscription.id}
                className="flex min-w-0 flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]"
              >
                <div className="h-1.5 bg-brand" aria-hidden="true" />
                <CardContent className="flex flex-1 flex-col p-4 text-center">
                  <div className="flex flex-col items-center gap-3">
                    {subscription.receiptUrl ? (
                      <a
                        href={subscription.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block size-16 shrink-0 overflow-hidden rounded-2xl border border-edge bg-surface-muted"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- comprobante externo desde Cloudinary */}
                        <img
                          src={subscription.receiptUrl}
                          alt="Comprobante"
                          className="size-full object-cover"
                        />
                      </a>
                    ) : (
                      <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-xl font-black text-brand">
                        {name.charAt(0).toUpperCase() || "A"}
                      </span>
                    )}

                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-accent">
                        Solicitud
                      </p>
                      <h2 className="mt-1 line-clamp-2 break-words font-display text-lg font-black leading-tight text-brand">
                        {name}
                      </h2>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 text-xs text-muted">
                    <p className="flex min-w-0 items-center justify-center gap-2">
                      <Mail className="size-4 shrink-0 text-accent" aria-hidden="true" />
                      <span className="truncate">{subscription.agentProfile.user.email}</span>
                    </p>
                    <p className="flex min-w-0 items-center justify-center gap-2">
                      <UserRound className="size-4 shrink-0 text-accent" aria-hidden="true" />
                      <span className="truncate">{subscription.agentProfile.type.replaceAll("_", " ")}</span>
                    </p>
                    <p className="flex min-w-0 items-center justify-center gap-2">
                      <CalendarDays className="size-4 shrink-0 text-accent" aria-hidden="true" />
                      <span className="truncate">{formatDate(subscription.createdAt)}</span>
                    </p>
                  </div>

                  <div className="mt-5 border-y border-edge py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted">
                      Plan solicitado
                    </p>
                    <p className="mt-1 text-base font-black text-brand">{subscription.plan.name}</p>
                    <p className="mt-1 font-display text-2xl font-black text-brand">
                      {formatPrice(Number(subscription.plan.price), subscription.plan.currency)}
                    </p>
                  </div>

                  <div className="mt-auto pt-4">
                    <SubscriptionReviewActions id={subscription.id} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        buildHref={(p) => `${ROUTES.panel.admin.subscriptions}?page=${p}`}
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  tone,
  Icon,
}: {
  label: string;
  value: string | number;
  hint: string;
  tone: string;
  Icon: typeof ReceiptText;
}) {
  return (
    <Card className="p-4 text-center">
      <div className="flex items-center justify-center gap-3">
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted">{label}</p>
          <p className="mt-1 font-display text-3xl font-black tracking-tight text-brand">
            {typeof value === "number" ? value.toLocaleString("es-PE") : value}
          </p>
        </div>
      </div>
      <p className="mx-auto mt-2 max-w-56 text-xs font-semibold leading-5 text-muted">{hint}</p>
    </Card>
  );
}
