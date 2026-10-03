import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Card, CardContent } from "@/shared/ui";
import { AdminPageHeader } from "@/app/(panel)/panel/admin/admin-shell";
import { getDeveloper, publishDeveloperProperty, rejectDeveloperProperty, publishDeveloperProject, rejectDeveloperProject } from "@/features/admin/api/server";
import { ROUTES } from "@/shared/config/routes";

async function reviewAction(formData: FormData) {
  "use server";
  const kind = String(formData.get("kind"));
  const id = String(formData.get("id"));
  const action = String(formData.get("action"));
  if (!id || !["publish", "reject"].includes(action)) return;
  if (kind === "property") await (action === "publish" ? publishDeveloperProperty(id) : rejectDeveloperProperty(id));
  if (kind === "project") await (action === "publish" ? publishDeveloperProject(id) : rejectDeveloperProject(id));
  revalidatePath(ROUTES.panel.admin.developers);
  revalidatePath(`${ROUTES.panel.admin.developers}/${String(formData.get("developerId") ?? "")}`);
}

export default async function AdminDeveloperDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { id } = await params;
  const { status: statusParam } = await searchParams;
  const status = statusParam === "REJECTED" ? "REJECTED" : "PENDING_REVIEW";
  const developer = await getDeveloper(id, status);
  const name = (developer.businessName ?? `${developer.user.firstName} ${developer.user.lastName ?? ""}`).trim();
  return <div className="flex flex-col gap-6"><AdminPageHeader eyebrow="Moderación" title={name} description={`${developer.user.email} · WhatsApp ${developer.whatsapp ?? "—"}`} /><Link href={ROUTES.panel.admin.developers} className="text-sm font-bold text-brand">← Volver a desarrolladoras</Link><ReviewQueue developerId={id} title="Propiedades" items={developer.properties} kind="property" nameKey="title" statusKey="status" /><ReviewQueue developerId={id} title="Proyectos" items={developer.projects} kind="project" nameKey="name" statusKey="status" /></div>;
}

function ReviewQueue({ developerId, title, items, kind, nameKey, statusKey }: { developerId: string; title: string; items: Array<{ id: string; status: string; title?: string; name?: string }>; kind: string; nameKey: "title" | "name"; statusKey: "status" }) {
  return <section><h2 className="mb-3 font-display text-2xl font-black text-brand">{title}</h2>{items.length === 0 ? <Card><CardContent className="py-6 text-sm text-muted">No hay fichas para revisar.</CardContent></Card> : <div className="grid gap-3">{items.map((item) => <Card key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="font-bold text-ink">{String(item[nameKey])}</p><p className="text-xs text-muted">{String(item[statusKey])}</p></div><form action={reviewAction} className="flex gap-2"><input type="hidden" name="id" value={item.id} /><input type="hidden" name="developerId" value={developerId} /><input type="hidden" name="kind" value={kind} /><button name="action" value="publish" className="rounded-card bg-brand px-3 py-2 text-xs font-bold text-on-brand">Publicar</button><button name="action" value="reject" className="rounded-card border border-edge px-3 py-2 text-xs font-bold text-brand">Rechazar</button></form></Card>)}</div>}</section>;
}
