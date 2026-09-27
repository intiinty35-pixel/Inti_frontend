"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui";
import { updatePlan } from "@/features/admin/api/client";
import type { Plan } from "@/features/owner/types/plan";

export function PlanActiveToggle({ plan }: { plan: Plan }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      await updatePlan(plan.id, {
        name: plan.name,
        price: Number(plan.price),
        durationDays: plan.durationDays,
        propertyLimit: plan.propertyLimit,
        projectLimit: plan.projectLimit,
        features: plan.features,
        isFree: plan.isFree,
        isDefault: plan.isDefault,
        highlight: plan.highlight,
        isActive: !plan.isActive,
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={toggle} disabled={loading}>
      {plan.isActive ? "Desactivar" : "Activar"}
    </Button>
  );
}
