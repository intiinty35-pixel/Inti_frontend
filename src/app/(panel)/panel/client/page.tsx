import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";
import { getSession } from "@/features/auth";
import { ROUTES } from "@/shared/config/routes";

export default async function PanelClientPage() {
  const session = await getSession();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-semibold text-ink">
        Hi, {session?.name ?? "Customer"}
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My favorites</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href={ROUTES.panel.client.favorites}
              className="text-sm font-medium text-brand"
            >
              View favorites
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}