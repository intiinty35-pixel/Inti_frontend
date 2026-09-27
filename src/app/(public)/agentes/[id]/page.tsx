import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/shared/ui";
import { buildMetadata } from "@/shared/lib/seo";
import { getAgentProfile } from "@/features/agents";
import { ListingGrid } from "@/features/listings";

interface AgentPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: AgentPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const agent = await getAgentProfile(id);
    return buildMetadata({
      title: `${agent.name} | Agente ARIZ`,
      description: `Perfil público de ${agent.name} en ARIZ.`,
      path: `/agentes/${id}`,
    });
  } catch {
    return buildMetadata({
      title: "Agente ARIZ",
      description: "Perfil público de agente inmobiliario.",
      path: `/agentes/${id}`,
    });
  }
}

export default async function AgentPage({ params }: AgentPageProps) {
  const { id } = await params;
  let agent;
  try {
    agent = await getAgentProfile(id);
  } catch {
    notFound();
  }

  return (
    <Container className="flex flex-1 flex-col gap-8 py-8">
      <section className="rounded-card border border-edge bg-surface p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex size-20 items-center justify-center rounded-card bg-brand text-3xl font-black text-accent">
            {agent.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-[0.18em] text-accent uppercase">Anunciante ARIZ</p>
            <h1 className="mt-1 text-3xl font-light text-brand">{agent.name}</h1>
            <p className="mt-1 text-sm text-muted">{agent.city}{agent.districts ? ` · ${agent.districts}` : ""}</p>
            {agent.status === "APPROVED" ? (
              <p className="mt-2 text-sm font-bold text-success">Perfil verificado</p>
            ) : null}
          </div>
        </div>
        <div className="mt-6 grid gap-3 text-sm text-muted sm:grid-cols-3">
          <p>Email: <span className="font-semibold text-ink">{agent.email}</span></p>
          {agent.phone ? <p>Teléfono: <span className="font-semibold text-ink">{agent.phone}</span></p> : null}
          {agent.website ? <p>Web: <span className="font-semibold text-ink">{agent.website}</span></p> : null}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted">{agent.properties.length} publicaciones activas</p>
            <h2 className="text-2xl font-light text-brand">Propiedades publicadas</h2>
          </div>
        </div>
        <div className="mt-5">
          {agent.properties.length > 0 ? (
            <ListingGrid listings={agent.properties} />
          ) : (
            <div className="rounded-card border border-dashed border-edge bg-surface-muted p-10 text-center text-sm text-muted">
              Este agente aún no tiene propiedades publicadas.
            </div>
          )}
        </div>
      </section>
    </Container>
  );
}
