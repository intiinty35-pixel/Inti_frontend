import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";
import { getSession } from "@/features/auth";

export default async function PanelOwnerPage() {
  const session = await getSession();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-semibold text-ink">
        Hi, {session?.name ?? "Owner"}
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active listings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-semibold text-brand">0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}