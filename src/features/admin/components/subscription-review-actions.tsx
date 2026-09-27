"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui";
import { reviewSubscription } from "@/features/admin/api/client";

export function SubscriptionReviewActions({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function handle(status: "ACTIVE" | "REJECTED") {
    setLoading(status === "ACTIVE" ? "approve" : "reject");
    try {
      await reviewSubscription(id, status, status === "REJECTED" ? "Comprobante no válido" : undefined);
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => handle("ACTIVE")} disabled={loading !== null}>
        {loading === "approve" ? "Aprobando..." : "Aprobar"}
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => handle("REJECTED")}
        disabled={loading !== null}
      >
        {loading === "reject" ? "Rechazando..." : "Rechazar"}
      </Button>
    </div>
  );
}
