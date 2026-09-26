import { Card, CardContent } from "@/shared/ui";

export default function PanelOwnerListingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-light text-brand">Mis publicaciones</h1>
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted">
          Tus propiedades publicadas aparecerán aquí.
        </CardContent>
      </Card>
    </div>
  );
}
