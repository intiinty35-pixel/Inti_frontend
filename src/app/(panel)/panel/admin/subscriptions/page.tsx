import { Card, CardContent } from "@/shared/ui";
import { formatPrice } from "@/shared/lib/format";
import { listPendingSubscriptions } from "@/features/admin/api/server";
import { SubscriptionReviewActions } from "@/features/admin/components/subscription-review-actions";

export default async function AdminSubscriptionsPage() {
  const subscriptions = await listPendingSubscriptions();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-light text-brand">Solicitudes de pago</h1>
        <p className="mt-1 text-sm text-muted">
          Revisa el comprobante y aprueba o rechaza la activación del plan.
        </p>
      </div>

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted">
            No hay solicitudes pendientes.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {subscriptions.map((subscription) => {
            const name =
              subscription.agentProfile.businessName ??
              `${subscription.agentProfile.user.firstName} ${subscription.agentProfile.user.lastName ?? ""}`.trim();

            return (
              <Card key={subscription.id}>
                <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    {subscription.receiptUrl ? (
                      <a
                        href={subscription.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block size-16 shrink-0 overflow-hidden rounded-card border border-edge bg-surface-muted"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- comprobante externo desde Cloudinary */}
                        <img
                          src={subscription.receiptUrl}
                          alt="Comprobante"
                          className="size-full object-cover"
                        />
                      </a>
                    ) : null}
                    <div>
                      <p className="font-semibold text-ink">{name}</p>
                      <p className="text-xs text-muted">{subscription.agentProfile.user.email}</p>
                      <p className="text-xs text-muted">
                        Solicita: {subscription.plan.name} ·{" "}
                        {formatPrice(Number(subscription.plan.price), subscription.plan.currency)}
                      </p>
                    </div>
                  </div>
                  <SubscriptionReviewActions id={subscription.id} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
