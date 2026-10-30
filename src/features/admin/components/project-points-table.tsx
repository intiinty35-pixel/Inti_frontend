"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { apiClient } from "@/shared/lib/api/client";
import type { AdminProjectWithPoints, ProjectPointsConfig } from "@/features/admin/api/project-points";

type LocalPointsInput = Record<string, Record<keyof ProjectPointsConfig, string>>;

export function ProjectPointsTable({
  projects,
}: {
  projects: AdminProjectWithPoints[];
}) {
  const router = useRouter();
  const [pointsInput, setPointsInput] = useState<LocalPointsInput>(() =>
    projects.reduce((acc, project) => {
      acc[project.id] = {
        CONTACTED: String(project.points.CONTACTED ?? 0),
        VISIT: String(project.points.VISIT ?? 0),
        OPERATION_COMPLETED: String(project.points.OPERATION_COMPLETED ?? 0),
      };
      return acc;
    }, {} as LocalPointsInput)
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateProjectPoint(
    projectId: string,
    status: keyof ProjectPointsConfig,
    value: string
  ) {
    const filtered = value.replace(/[^0-9]/g, "");
    setPointsInput((current) => ({
      ...current,
      [projectId]: {
        ...current[projectId],
        [status]: filtered,
      },
    }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const updates = Object.entries(pointsInput).map(([projectId, pts]) => ({
        projectId,
        points: {
          CONTACTED: parseInt(pts.CONTACTED || "0", 10),
          VISIT: parseInt(pts.VISIT || "0", 10),
          OPERATION_COMPLETED: parseInt(pts.OPERATION_COMPLETED || "0", 10),
        },
      }));
      await apiClient.patch<AdminProjectWithPoints[]>(
        "/admin/campaigns/project-points/batch",
        { updates }
      );
      setMessage("Puntos actualizados correctamente.");
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudieron guardar los puntos."
      );
    } finally {
      setSaving(false);
    }
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-card border border-edge bg-surface-muted p-8 text-center">
        <p className="text-sm font-semibold text-muted">
          No hay proyectos INTI disponibles para configurar puntos.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
      <div className="overflow-x-auto rounded-card border border-edge">
        <table className="w-full text-sm">
          <thead className="border-b border-edge bg-surface-muted">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-muted">
                Proyecto
              </th>
              <th className="px-4 py-3 text-center text-xs font-black uppercase tracking-wider text-muted">
                Contactado
              </th>
              <th className="px-4 py-3 text-center text-xs font-black uppercase tracking-wider text-muted">
                Visita
              </th>
              <th className="px-4 py-3 text-center text-xs font-black uppercase tracking-wider text-muted">
                Operación
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-edge bg-surface">
            {projects.map((project) => (
              <tr key={project.id} className="transition-colors hover:bg-surface-muted">
                <td className="px-4 py-3">
                  <p className="font-bold text-ink">{project.name}</p>
                  <p className="text-xs text-muted">{project.slug}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={pointsInput[project.id]?.CONTACTED ?? "0"}
                      onChange={(event) =>
                        updateProjectPoint(project.id, "CONTACTED", event.target.value)
                      }
                      className="h-9 w-20 rounded-card border border-edge bg-canvas px-2 text-center text-sm font-bold text-brand outline-none transition-colors focus:border-brand"
                    />
                    <span className="text-xs font-bold text-muted">pts</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={pointsInput[project.id]?.VISIT ?? "0"}
                      onChange={(event) =>
                        updateProjectPoint(project.id, "VISIT", event.target.value)
                      }
                      className="h-9 w-20 rounded-card border border-edge bg-canvas px-2 text-center text-sm font-bold text-brand outline-none transition-colors focus:border-brand"
                    />
                    <span className="text-xs font-bold text-muted">pts</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={pointsInput[project.id]?.OPERATION_COMPLETED ?? "0"}
                      onChange={(event) =>
                        updateProjectPoint(project.id, "OPERATION_COMPLETED", event.target.value)
                      }
                      className="h-9 w-20 rounded-card border border-edge bg-canvas px-2 text-center text-sm font-bold text-brand outline-none transition-colors focus:border-brand"
                    />
                    <span className="text-xs font-bold text-muted">pts</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          {message ? (
            <p className="text-xs font-bold text-success">{message}</p>
          ) : null}
          {error ? (
            <p className="text-xs font-bold text-red-700">{error}</p>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-card bg-brand px-5 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover disabled:opacity-60"
        >
          <Save className="size-4" aria-hidden="true" />
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
