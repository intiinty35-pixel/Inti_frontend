import Link from "next/link";
import { ArrowRightIcon, ChartIcon, CheckCircleIcon, SparkleIcon, WhatsappIcon } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";

const investmentCards = [
  {
    title: "Invierte en proyectos con potencial",
    description:
      "Explora oportunidades inmobiliarias con plusvalia proyectada, ubicaciones estrategicas y acompanamiento de ARIZ.",
    metric: "Desde S/ 3,000",
    Icon: ChartIcon,
  },
  {
    title: "Evalua tu retorno antes de separar",
    description:
      "Calcula escenarios por capital, plazo y objetivo para encontrar la alternativa que encaja con tu perfil.",
    metric: "ROI estimado",
    Icon: SparkleIcon,
  },
];

const trustItems = [
  { label: "Respaldo legal", Icon: CheckCircleIcon },
  { label: "Asesoria personalizada", Icon: WhatsappIcon },
  { label: "Alta plusvalia", Icon: ChartIcon },
];

export function InvestmentEntrySection() {
  return (
    <section className="bg-[#F3F4F8] px-3 py-8 sm:px-4 lg:px-5 xl:px-6">
      <div className="mx-auto grid w-full gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
        <div className="flex flex-col justify-between rounded-[8px] border border-edge bg-white p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-[11px] font-black tracking-[0.16em] text-accent uppercase">
              Ariz Invest Club
            </p>
            <h2 className="mt-3 text-2xl leading-tight font-black tracking-tight text-[#071A5A] sm:text-3xl">
              Oportunidades de inversion inmobiliaria
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#596273] sm:text-base">
              Una ventana para revisar oportunidades, simular retornos y hablar directo con un
              asesor antes de tomar una decision.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {trustItems.map(({ label, Icon }) => (
              <div key={label} className="flex items-center gap-2 rounded-[6px] bg-[#F8F9FC] p-3">
                <Icon className="size-5 shrink-0 text-accent" />
                <span className="text-xs font-black text-[#071A5A]">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {investmentCards.map(({ title, description, metric, Icon }) => (
            <Link
              key={title}
              href={ROUTES.investments}
              className="group flex min-h-[220px] flex-col justify-between rounded-[8px] border border-edge bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex size-11 items-center justify-center rounded-[6px] bg-accent/15 text-accent">
                    <Icon className="size-6" />
                  </span>
                  <span className="rounded-[6px] bg-[#F8F9FC] px-3 py-1 text-[11px] font-black text-[#071A5A]">
                    {metric}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-black tracking-tight text-[#071A5A]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#596273]">{description}</p>
              </div>

              <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#071A5A] group-hover:text-accent">
                Ir a inversion Ariz
                <ArrowRightIcon className="size-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
