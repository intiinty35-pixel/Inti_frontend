"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, Checkbox, Input } from "@/shared/ui";
import { AdminRequestError, createPlan } from "@/features/admin/api/client";

export function PlanForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    setLoading(true);

    try {
      await createPlan({
        name: String(form.get("name") ?? "").trim(),
        price: Number(form.get("price") ?? 0),
        durationDays: Number(form.get("durationDays") ?? 30),
        propertyLimit: Number(form.get("propertyLimit") ?? 0),
        projectLimit: Number(form.get("projectLimit") ?? 0),
        features: String(form.get("features") ?? "")
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
        isFree: form.get("isFree") === "on",
        isDefault: form.get("isDefault") === "on",
        highlight: form.get("highlight") === "on",
      });
      (event.target as HTMLFormElement).reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof AdminRequestError ? err.messages[0] : "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="mb-4 font-semibold text-ink">Crear nuevo plan</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input name="name" label="Nombre" required />
            <Input name="price" type="number" min={0} label="Precio mensual (S/)" defaultValue={0} required />
            <Input name="durationDays" type="number" min={1} label="Duración (días)" defaultValue={30} required />
            <Input name="propertyLimit" type="number" min={0} label="Límite de propiedades" defaultValue={5} required />
            <Input name="projectLimit" type="number" min={0} label="Límite de proyectos" defaultValue={0} required />
            <Input name="features" label="Beneficios (separados por coma)" placeholder="Estadísticas, Soporte por correo" />
          </div>
          <div className="flex flex-wrap gap-6">
            <Checkbox name="isFree" label="Es un plan gratuito" />
            <Checkbox name="isDefault" label="Asignar automáticamente al aprobar un perfil" />
            <Checkbox name="highlight" label="Marcar como recomendado" />
          </div>
          {error ? <p className="text-sm text-error">{error}</p> : null}
          <div>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear plan"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
