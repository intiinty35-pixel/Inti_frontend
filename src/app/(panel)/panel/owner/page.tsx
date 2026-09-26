import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";
import { getSession } from "@/features/auth";

const STATUS_NOTICES = {
  PENDING: {
    style: "bg-warning/10 text-warning",
    text: "Tu perfil está pendiente de validación administrativa. Podrás publicar cuando sea aprobado.",
  },
  REJECTED: {
    style: "bg-error/10 text-error",
    text: "Tu perfil no fue aprobado. Comunícate con Ariz Proyectos para más información.",
  },
} as const;

export default async function PanelOwnerPage() {
  const session = await getSession();
  const status = session?.professionalStatus;
  const notice = status === "PENDING" || status === "REJECTED" ? STATUS_NOTICES[status] : null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-light text-brand">Hola, {session?.name ?? "bienvenido"}</h1>
      {notice ? (
        <p role="status" className={`rounded-card px-4 py-3 text-sm ${notice.style}`}>
          {notice.text}
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Publicaciones activas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-light text-brand">0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
