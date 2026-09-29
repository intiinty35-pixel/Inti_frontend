"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ConfirmDialog } from "@/shared/ui";
import { reviewSubscription } from "@/features/admin/api/client";

export function SubscriptionReviewActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<"ACTIVE" | "REJECTED" | null>(null);
  const [loading, setLoading] = useState(false);

  async function handle(status: "ACTIVE" | "REJECTED") {
    setLoading(true);
    try {
      await reviewSubscription(id, status, status === "REJECTED" ? "Comprobante no válido" : undefined);
      setPending(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => setPending("ACTIVE")}>
        Aprobar
      </Button>
      <Button size="sm" variant="secondary" onClick={() => setPending("REJECTED")}>
        Rechazar
      </Button>

      <ConfirmDialog
        open={pending === "ACTIVE"}
        title="¿Aprobar esta solicitud y activar el plan?"
        confirmLabel="Aprobar"
        variant="primary"
        loading={loading}
        onConfirm={() => handle("ACTIVE")}
        onCancel={() => setPending(null)}
      />
      <ConfirmDialog
        open={pending === "REJECTED"}
        title="¿Rechazar esta solicitud de pago?"
        confirmLabel="Rechazar"
        variant="danger"
        loading={loading}
        onConfirm={() => handle("REJECTED")}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
