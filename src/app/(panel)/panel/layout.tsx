import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/shared/ui";
import { getSession } from "@/features/auth";
import { getModulesForRole } from "@/shared/config/modules";
import { ROLE_LABELS, can } from "@/shared/config/roles";
import { ROUTES } from "@/shared/config/routes";
import { PanelNav } from "@/app/(panel)/panel/panel-nav";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session || !can("panel:access", session.role)) {
    redirect(ROUTES.login);
  }

  const modules = getModulesForRole(session.role);

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 flex w-64 flex-col gap-6 border-r border-edge bg-surface p-6">
        <Link href={ROUTES.home} className="font-display text-xl font-semibold text-brand">
          Ariz
        </Link>
        <div className="flex flex-col">
          <p className="font-medium text-ink">{session.name}</p>
          <p className="text-sm text-muted">{ROLE_LABELS[session.role]}</p>
        </div>
        <PanelNav modules={modules} />
      </aside>
      <main className="pl-64">
        <Container className="py-10">{children}</Container>
      </main>
    </div>
  );
}