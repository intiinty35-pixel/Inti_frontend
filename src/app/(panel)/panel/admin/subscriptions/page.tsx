import { Card, CardContent, Pagination } from "@/shared/ui";
import { formatPrice } from "@/shared/lib/format";
import { ROUTES } from "@/shared/config/routes";
import { listPendingSubscriptions } from "@/features/admin/api/server";
import { SubscriptionReviewActions } from "@/features/admin/components/subscription-review-actions";
import { AdminPageHeader } from "@/app/(panel)/panel/admin/admin-shell";

interface AdminSubscriptionsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminSubscriptionsPage({ searchParams }: AdminSubscriptionsPageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { items: subscriptions, total, pageSize } = await listPendingSubscriptions(page);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        eyebrow="Pagos"
        title="Solicitudes de pago"
        description="Revisa el comprobante y aprueba o rechaza la activación del plan."
      />

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted">
            No hay solicitudes pendientes.
          </CardContent>
        </Card>
      ) : (
        <>
        <div className="grid gap-4 lg:grid-cols-2">
          {subscriptions.map((subscription) => {
            const name =
              subscription.agentProfile.businessName ??
              `${subscription.agentProfile.user.firstName} ${subscription.agentProfile.user.lastName ?? ""}`.trim();

            return (
              <Card key={subscription.id} className="p-5">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    {subscription.receiptUrl ? (
                      <a
                        href={subscription.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block size-16 shrink-0 overflow-hidden rounded-xl border border-edge bg-surface-muted"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- comprobante externo desde Cloudinary */}
                        <img
                          src={subscription.receiptUrl}
                          alt="Comprobante"
                          className="size-full object-cover"
                        />
                      </a>
                    ) : (
                      <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-brand text-lg font-black text-on-brand">
                        {name.charAt(0).toUpperCase() || "A"}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-bold text-ink">{name}</p>
                      <p className="text-sm text-muted">{subscription.agentProfile.user.email}</p>
                      <p className="mt-1 text-sm font-semibold text-brand">
                        {subscription.plan.name} ·{" "}
                        {formatPrice(Number(subscription.plan.price), subscription.plan.currency)}
                      </p>
                    </div>
                  </div>
                  <SubscriptionReviewActions id={subscription.id} />
                </div>
              </Card>
            );
          })}
        </div>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          buildHref={(p) => `${ROUTES.panel.admin.subscriptions}?page=${p}`}
        />
        </>
      )}
    </div>
  );
}
