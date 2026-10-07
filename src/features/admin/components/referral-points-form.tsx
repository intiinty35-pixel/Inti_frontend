"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { apiClient } from "@/shared/lib/api/client";
import type { ReferralStatus, ReferralStatusPoint } from "@/features/admin/api/referrals";

type PointsState = Record<ReferralStatus, number>;

export function ReferralPointsForm({
  statusPoints,
}: {
  statusPoints: ReferralStatusPoint[];
}) {
  const router = useRouter();
  const [points, setPoints] = useState<PointsState>(() =>
    statusPoints.reduce(
      (acc, point) => ({ ...acc, [point.status]: point.points }),
      {} as PointsState,
    ),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      await apiClient.patch<ReferralStatusPoint[]>("/admin/referrals/status-points", points);
      setMessage("Puntos actualizados.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudieron guardar los puntos.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
      <div className="grid gap-2 sm:grid-cols-3">
        {statusPoints.map((point) => (
          <label
            key={point.status}
            className="rounded-card border border-edge bg-canvas px-3 py-2 text-center"
          >
            <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-muted">
              {point.label}
            </span>
            <span className="mt-2 flex items-center justify-center gap-1">
              <span className="text-sm font-black text-brand">+</span>
              <input
                name={point.status}
                type="number"
                min={0}
                step={1}
                value={points[point.status] ?? 0}
                onChange={(event) =>
                  setPoints((current) => ({
                    ...current,
                    [point.status]: Math.max(0, Number(event.target.value) || 0),
                  }))
                }
                className="h-9 w-20 rounded-card border border-edge bg-surface px-2 text-center text-base font-black text-brand outline-none transition-colors focus:border-brand"
              />
              <span className="text-xs font-bold text-muted">pts</span>
            </span>
          </label>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-card bg-brand px-4 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover disabled:opacity-60"
        >
          <Save className="size-4" aria-hidden="true" />
          {saving ? "Guardando..." : "Guardar puntos"}
        </button>
        {message ? <p className="text-center text-xs font-bold text-success">{message}</p> : null}
        {error ? <p className="text-center text-xs font-bold text-red-700">{error}</p> : null}
      </div>
    </form>
  );
}
