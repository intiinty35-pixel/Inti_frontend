import { Card, CardContent } from "@/shared/ui";

export default function PanelOwnerListingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-semibold text-ink">My listings</h1>
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted">
          Your published properties will appear here.
        </CardContent>
      </Card>
    </div>
  );
}