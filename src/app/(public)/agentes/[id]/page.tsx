import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/shared/ui";
import { CheckIcon, PinIcon, UserIcon } from "@/shared/ui/icons";
import { buildMetadata } from "@/shared/lib/seo";
import { getAgentProfile } from "@/features/agents";
import { AgentContactCard } from "@/features/listings/components/profile_agent/agent-contact-card";
import { AgentListings } from "@/features/listings/components/profile_agent/agent-listings";

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

  /* Campos opcionales que quiza el backend aun no expone: se leen sin romper. */
  const extra = agent as unknown as Record<string, unknown>;
  const whatsappRaw = typeof extra.whatsapp === "string" ? extra.whatsapp : agent.phone;
  const whatsappDigits = whatsappRaw?.replace(/\D/g, "") || undefined;
  const locationLine = [agent.districts, agent.city].filter(Boolean).join(", ");
  const zoneName = agent.districts || agent.city;
  const whatsappNumber = whatsappDigits
    ? (() => {
        const digits = whatsappDigits.replace(/^51/, "");
        const groups = digits.match(/.{1,3}/g)?.join(" ") || digits;
        return `+51 ${groups}`;
      })()
    : null;
  const propertyCount = agent.properties.length;
  const firstName = agent.name.split(" ")[0] || agent.name;
  const initials = agent.name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  /* El backend puede o no exponer una foto de perfil: se lee sin romper. */
  let agentPhoto: string | null = null;
  for (const key of ["photo", "avatar", "image", "photoUrl"] as const) {
    const value = extra[key];
    if (typeof value === "string" && value.trim()) {
      agentPhoto = value;
      break;
    }
  }

  return (
    <Container size="full" className="flex flex-1 flex-col gap-8 py-6 lg:py-8">
      <section className="overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)]">
        <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="relative min-h-[380px] overflow-hidden bg-brand p-6 text-white sm:p-8 lg:p-10">
            {/* Unica decoracion: chevron/roof del logo ARIZ en accent, detras de la tarjeta de info. */}
            <svg
              aria-hidden
              className="pointer-events-none absolute -left-24 -bottom-24 h-[32rem] w-[32rem] text-accent opacity-[0.13]"
              viewBox="0 0 240 240"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M30 210 120 40 210 210" />
              <path d="M70 210 120 118 170 210" />
              <path d="M30 210h180" />
            </svg>

            <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:items-stretch">
              {/* Tarjeta de informacion */}
              <div className="flex min-h-[300px] flex-col justify-between gap-8">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                      Anunciante ARIZ
                    </span>
                    {agent.status === "APPROVED" ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                        <CheckIcon className="size-3.5" />
                        Verificado
                      </span>
                    ) : null}
                  </div>

                  <h1 className="mt-4 max-w-4xl font-display text-3xl leading-tight font-black tracking-tight capitalize sm:text-4xl">
                    {agent.name}
                  </h1>

                  {locationLine ? (
                    <p className="mt-2.5 flex items-center gap-2 text-sm font-medium text-white/80">
                      <PinIcon className="size-4 shrink-0 text-accent" />
                      <span className="capitalize">Agente inmobiliario · {locationLine}</span>
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
                  <div>
                    <p className="font-display text-2xl font-black text-white">{propertyCount}</p>
                    <p className="mt-1 text-xs text-white/70">
                      {propertyCount === 1 ? "propiedad activa" : "propiedades activas"}
                    </p>
                  </div>

                  <div className="sm:border-l sm:border-white/20 sm:pl-8">
                    <p className="font-display text-2xl font-black text-white capitalize">{zoneName}</p>
                    <p className="mt-1 text-xs text-white/70">zona de atención</p>
                  </div>

                  {whatsappNumber ? (
                    <div className="sm:border-l sm:border-white/20 sm:pl-8">
                      <p className="font-display text-2xl font-black text-white">{whatsappNumber}</p>
                      <p className="mt-1 text-xs text-white/70">WhatsApp</p>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Tarjeta de foto del agente */}
              <div className="overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)]">
                {agentPhoto ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element -- foto del perfil del agente */}
                    <img
                      src={agentPhoto}
                      alt={`Foto de ${agent.name}`}
                      className="aspect-[4/5] w-full object-cover"
                    />
                  </>
                ) : (
                  <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-4 bg-brand-soft p-6 text-center">
                    <UserIcon className="size-24 text-brand/25" />
                    <span className="flex size-16 items-center justify-center rounded-full ring-4 ring-accent font-display text-3xl font-black text-on-accent">
                      {initials}
                    </span>
                    <p className="text-sm font-medium text-muted">Agente sin foto de perfil</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 bg-surface p-6 sm:p-8 xl:p-7">
            <div>
              <p className="text-[11px] font-black tracking-[0.18em] text-accent uppercase">Contacto directo</p>
              <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-brand">
                Habla con {firstName}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Pide información, agenda una visita o consulta detalles de sus inmuebles publicados.
              </p>
            </div>

            <AgentContactCard
              name={agent.name}
              phone={agent.phone ?? undefined}
              email={agent.email ?? undefined}
              whatsappDigits={whatsappDigits}
            />

            {agent.website ? (
              <a
                href={agent.website.startsWith("http") ? agent.website : `https://${agent.website}`}
                target="_blank"
                rel="noreferrer"
                className="block truncate rounded-card border border-edge bg-surface-muted px-4 py-3 text-sm font-bold text-brand transition-colors hover:border-brand"
              >
                {agent.website.replace(/^https?:\/\//, "")}
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-card border border-edge bg-surface p-4 shadow-[var(--shadow-card)] sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-2 border-b border-edge pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-black tracking-[0.18em] text-accent uppercase">Portafolio</p>
            <h2 className="mt-1 font-display text-2xl font-black tracking-tight text-brand sm:text-3xl">
              Propiedades publicadas
            </h2>
          </div>
          <p className="text-sm font-semibold text-muted">
            {propertyCount} {propertyCount === 1 ? "resultado disponible" : "resultados disponibles"}
          </p>
        </div>

        <AgentListings
          listings={agent.properties}
          agentName={agent.name}
          whatsappDigits={whatsappDigits}
        />
      </section>
    </Container>
  );
}
